import { Socket } from "socket.io";
import BufferedInput from "../../communication/race/BufferedInput";
import {
	AnswerQuestionEvent,
	GameCreatedEvent,
	GameEndEvent,
	LapCompletedEvent,
	MoveRequestEvent,
	PlayerLeftEvent,
	QuestionAnsweredEvent,
	QuestionFoundEvent,
	QuestionFoundFromBookEvent,
	UseItemEvent,
} from "../../communication/race/EventInterfaces";
import { CLIENT_EVENT_NAMES as CE, SERVER_EVENT_NAMES as SE } from "../../communication/race/EventNames";
import { PlayerDTO } from "../../communication/race/PlayerDTO";
import RaceGameState from "../../communication/race/RaceGameState";
import { StartingRaceGridInfo } from "../../communication/race/StartingGridInfo";
import UserInfo from "../../communication/user/UserInfo";
import QuestionRepository from "../../server/data/QuestionRepository";
import Room from "../../server/rooms/Room";
import User from "../../server/rooms/User";
import { getObjectValues } from "../../utils/Utils";
import { Clock } from "../clock/Clock";
import { ServerGame } from "../Game";
import State, { GameState } from "../gameState/State";
import PreGameFactory from "../gameState/StateFactory";
import { ItemUsedEvent } from "./../../communication/race/EventInterfaces";
import RaceGrid from "./grid/RaceGrid";
import Item, { ItemType } from "./items/Item";
import HumanPlayer from "./player/HumanPlayer";
import Player from "./player/Player";
import { PlayerRepository } from "./player/playerRepository/PlayerRepository";
import { Question } from "./question/Question";
import RaceGameController from "./RaceGameController";
import { RACE_PARAMETERS } from "./RACE_PARAMETERS";

export default class ServerRaceGameController extends RaceGameController implements State, ServerGame {
	private readonly ITEM_RESPAWN_DURATION: number = 30 * 1000;
	private context: Room;
	private inputBuffer: BufferedInput[] = [];
	private isGameCreated: boolean = false;
	private gameId: string;
	private gameDbId: number = null;
	private itemPickUpTimestamps: Number[] = [];
	private questionRepo: QuestionRepository;
	private state: GameState = GameState.RaceGame;
	private isSinglePlayer: boolean;

	constructor(
		gameTime: number,
		gameStartTimeStamp: number,
		grid: RaceGrid,
		playerRepo: PlayerRepository,
		users: User[],
		gameId: string,
		questionRepo: QuestionRepository,
		isSinglePlayer: boolean
	) {
		//The server has the truth regarding the start timestamp.
		super(gameTime, gameStartTimeStamp, grid, playerRepo);
		this.gameId = gameId;
		this.questionRepo = questionRepo;
		this.isSinglePlayer = isSinglePlayer;
		this.handleAllUsersSocketEvents(users);
	}

	public setContext(context: Room): void {
		this.context = context;
	}

	public getGameId(): string {
		return this.gameId;
	}

	public getStateType(): GameState {
		return this.state;
	}

	private emitGameCreatedEvent(): void {
		this.context
			.getStatsRepo()
			.addGameStats(this.gameDuration, "RaceGame", this.playerRepo.getAllPlayers().length, new Date())
			.then((res) => (this.gameDbId = res))
			.catch((err) => console.log(err));

		this.isGameCreated = true;
		this.context
			.getNamespace()
			.to(this.context.getRoomString())
			.emit(CE.GAME_CREATED, <GameCreatedEvent>{
				gameTime: this.gameDuration,
				gameStartTimeStamp: this.gameStartTimeStamp,
				grid: <StartingRaceGridInfo>{
					width: this.grid.getWidth(),
					height: this.grid.getHeight(),
					nonWalkablePositions: this.grid.getNonWalkablePositions(),
					startingPositions: this.grid.getStartingPositions(),
					finishLinePositions: this.grid.getFinishLinePositions(),
					itemStates: this.grid.getItemsState(),
				},
				players: this.getPlayersDTO(),
				isSinglePlayer: this.isSinglePlayer,
			});
	}

	private getGameState(): RaceGameState {
		let gameState: RaceGameState = { timeStamp: 0, itemsState: [], players: [], remainingTime: this.timeRemaining };
		gameState.itemsState = this.grid.getItemsState();
		this.playerRepo.getAllPlayers().forEach((player: Player) => {
			gameState.players.push(player.getPlayerState());
		});

		gameState.timeStamp = Clock.now();
		return gameState;
	}

	public update(): void {
		if (!this.isGameCreated) this.emitGameCreatedEvent();
		if (this.timeRemaining <= 0) this.gameFinished();

		this.resolveInputs();
		super.update();
		this.handleItemsRespawn();
		this.context.getNamespace().to(this.context.getRoomString()).emit(CE.GAME_UPDATE, this.getGameState());
	}

	protected gameFinished(): void {
		this.context.getStatsRepo().updateEndGameStats(this.gameDbId, this.playerRepo.getAllPlayers().length, new Date());
		this.context
			.getNamespace()
			.to(this.context.getRoomString())
			.emit(CE.GAME_END, <GameEndEvent>{ players: this.getPlayersDTO() });
		this.removeAllUsersSocketEvents();
		this.context.removeGameFromRepo(this);
		this.context.transitionTo(PreGameFactory.createPreGame(this.context.getUsers()));
	}

	public userJoined(user: User): void {
		this.handleSocketEvents(user.socket);
	}

	public userLeft(user: User): void {
		this.playerRepo.removePlayer(user.userId);
		this.context
			.getNamespace()
			.to(this.context.getRoomString())
			.emit(CE.PLAYER_LEFT, <PlayerLeftEvent>{ playerId: user.userId });
		this.removeSocketEvents(user.socket);

		if (this.context.isRoomEmtpty()) {
			this.context.removeGameFromRepo(this);
		}
	}

	private handleSocketEvents(socket: Socket): void {
		socket.on(SE.USE_ITEM, (data: UseItemEvent) => {
			const newInput: BufferedInput = { eventType: SE.USE_ITEM, data: data };
			this.inputBuffer.push(newInput);
		});

		socket.on(SE.MOVE_REQUEST, (data: MoveRequestEvent) => {
			//We're just ignoring the request if the game isn't started yet.
			if (this.isGameStarted) {
				const newInput: BufferedInput = { eventType: SE.MOVE_REQUEST, data: data };
				this.inputBuffer.push(newInput);
			}
		});

		socket.on(SE.ANSWER_QUESTION, (data: AnswerQuestionEvent) => {
			const lag = data.clientTimestamp - Clock.now();
			const newData: AnswerQuestionEvent = {
				playerId: data.playerId,
				clientTimestamp: data.clientTimestamp,
				answerTimestamp: data.answerTimestamp + lag,
				targetLocation: data.targetLocation,
				answer: data.answer,
			};
			const newInput: BufferedInput = { eventType: SE.ANSWER_QUESTION, data: newData };
			this.inputBuffer.push(newInput);
		});
	}

	private removeSocketEvents(socket: Socket): void {
		const events = getObjectValues(SE);
		for (var key in events) {
			if (events.hasOwnProperty(key)) {
				socket.removeAllListeners(events[key]);
			}
		}
	}

	private handleAllUsersSocketEvents(users: User[]): void {
		users.forEach((user) => this.handleSocketEvents(user.socket));
	}

	private removeAllUsersSocketEvents(): void {
		const users = this.context.getUsers();
		users.forEach((user) => this.removeSocketEvents(user.socket));
	}

	private findHumanPlayer(playerId: string): HumanPlayer {
		const player = this.playerRepo.findPlayer(playerId);
		if (!(player instanceof HumanPlayer)) {
			throw new Error("No human player found");
		}
		return player;
	}

	public resolveInputs(): void {
		this.inputBuffer.forEach((input: BufferedInput) => {
			let inputData: any = input.data;
			let player: HumanPlayer;
			switch (input.eventType) {
				case SE.USE_ITEM:
					try {
						this.itemUsed((<UseItemEvent>inputData).itemType, (<UseItemEvent>inputData).targetPlayerId, (<UseItemEvent>inputData).fromPlayerId);
						if ((<UseItemEvent>inputData).itemType == ItemType.Book) {
							this.useBook((<UseItemEvent>inputData).targetPlayerId);
						}
						this.context
							.getNamespace()
							.to(this.context.getRoomString())
							.emit(CE.ITEM_USED, <ItemUsedEvent>{
								itemType: (<UseItemEvent>inputData).itemType,
								targetPlayerId: (<UseItemEvent>inputData).targetPlayerId,
								fromPlayerId: (<UseItemEvent>inputData).fromPlayerId,
							});
					} catch (error) {
						console.log(error);
					}
					break;

				case SE.MOVE_REQUEST:
					if (this.isMoveRequestValid(<MoveRequestEvent>inputData)) {
						try {
							player = this.findHumanPlayer((<MoveRequestEvent>inputData).playerId);
							this.sendQuestionToPlayer(
								player.getInfoForQuestion().language,
								player.getInfoForQuestion().schoolGrade,
								player,
								(<MoveRequestEvent>inputData).targetLocation
							);
						} catch (err) {
							console.log(err);
						}
					}
					break;

				case SE.ANSWER_QUESTION:
					try {
						const correctionStartTimestamp = Clock.now();
						player = this.findHumanPlayer((<AnswerQuestionEvent>inputData).playerId);
						if (player.isWorkingOnQuestion()) {
							const answerTimestamp = (<AnswerQuestionEvent>inputData).answerTimestamp;
							const userInfo: UserInfo = this.context.getUserById((<AnswerQuestionEvent>inputData).playerId).userInfo;
							const clientAnswerLabel = (<AnswerQuestionEvent>inputData).answer.label;
							const clientAnswerId = (<AnswerQuestionEvent>inputData).answer.id;
							const correspondingAnswer = player.getAnswerFromActiveQuestion(clientAnswerLabel);
							let answerIsRight = false;
							if (correspondingAnswer !== undefined) {
								answerIsRight =
									correspondingAnswer.getIsRight() ||
									clientAnswerLabel == "42, The Answer to the Ultimate Question of Life, the Universe, and Everything"; //DEBUG
							}
							const questionId = player.getActiveQuestion().getId();
							const moveTimestamp = answerTimestamp + (Clock.now() - correctionStartTimestamp);

							super.playerAnsweredQuestion(
								answerIsRight,
								(<AnswerQuestionEvent>inputData).targetLocation,
								(<AnswerQuestionEvent>inputData).playerId,
								moveTimestamp
							);
							//Send answer correction to clients
							this.context
								.getNamespace()
								.to(this.context.getRoomString())
								.emit(CE.QUESTION_ANSWERED, <QuestionAnsweredEvent>{
									playerId: player.id,
									answerIsRight: answerIsRight,
									targetLocation: (<AnswerQuestionEvent>inputData).targetLocation,
									correctionTimestamp: moveTimestamp,
								});

							//Save answer for stats
							this.context
								.getStatsRepo()
								.addAnsweredQuestionStats(
									this.gameDbId,
									userInfo,
									new Date(player.getLastQuestionPromptTimestamp()),
									new Date(Clock.now()),
									questionId,
									clientAnswerLabel,
									clientAnswerId
								);
						} else {
							console.log(`Error: Player tried to give an answer while not having active question.`);
						}
					} catch (error) {
						console.log(error);
					}

					break;

				default:
					break;
			}
		});
		this.inputBuffer = [];
	}

	private async findQuestionForPlayer(player: HumanPlayer, language: string, schoolGrade: number, requestedDifficulty: number): Promise<Question> {
		let questionIdArray: number[];
		let actualDifficulty = requestedDifficulty;
		while (!questionIdArray || !questionIdArray.length) {
			questionIdArray = await this.questionRepo.getQuestionsIdByDifficulty(language, schoolGrade, actualDifficulty);
			//Remove questions already answered by the player
			questionIdArray = questionIdArray.filter(
				(questionId) => !player.getAnsweredQuestionsId().some((answeredQuestionId) => answeredQuestionId == questionId)
			);
			//Basically, if there are no unanswered question left of the given difficulty, we lower the difficulty.
			//If it's not possible, we increase the difficulty
			//If it's not possible, we simply reset the player answered questions id
			if (!questionIdArray || !questionIdArray.length) {
				if (actualDifficulty <= requestedDifficulty) {
					if (actualDifficulty != RACE_PARAMETERS.QUESTION.MIN_DIFFICULTY) {
						actualDifficulty--;
					} else if (requestedDifficulty != RACE_PARAMETERS.QUESTION.MAX_DIFFICULTY) {
						actualDifficulty = requestedDifficulty + 1;
					} else {
						player.resetAnsweredQuestionsId();
						actualDifficulty = requestedDifficulty;
					}
				} else if (actualDifficulty == RACE_PARAMETERS.QUESTION.MAX_DIFFICULTY) {
					player.resetAnsweredQuestionsId();
					actualDifficulty = requestedDifficulty;
				} else {
					actualDifficulty++;
				}
			}
		}
		const randomPosition = Math.floor(Math.random() * questionIdArray.length);
		return this.questionRepo.getQuestionById(questionIdArray[randomPosition], language, schoolGrade);
	}

	private sendQuestionToPlayer(language: string, schoolGrade: number, player: HumanPlayer, targetLocation: Point): void {
		this.findQuestionForPlayer(player, language, schoolGrade, player.getDifficulty(targetLocation))
			.then((question) => {
				player.promptQuestion(question);
				this.context
					.getNamespace()
					.to(player.id)
					.emit(CE.QUESTION_FOUND, <QuestionFoundEvent>{
						targetLocation: targetLocation,
						questionDTO: question.getDTO(),
					});
			})
			.catch((error) => console.log(error));
	}

	private getPlayersDTO(): PlayerDTO[] {
		let playersDTO: PlayerDTO[] = [];
		this.playerRepo.getAllPlayers().forEach((player: Player) => {
			playersDTO.push(player.getPlayerDTO());
		});
		return playersDTO;
	}

	protected handleItemCollisions(): void {
		this.playerRepo.getAllPlayers().forEach((player) => {
			const pickedUpItem: Item = this.grid.handleItemCollision(player);
			if (pickedUpItem != null) {
				this.itemPickUpTimestamps.push(Clock.now());
				if (pickedUpItem.type == ItemType.Brainiac) {
					this.context
						.getNamespace()
						.to(this.context.getRoomString())
						.emit(CE.ITEM_USED, <ItemUsedEvent>{
							itemType: pickedUpItem.type,
							targetPlayerId: player.getId(),
							fromPlayerId: player.getId(),
						});
				}
			}
		});
	}

	private handleItemsRespawn(): void {
		this.itemPickUpTimestamps.forEach((itemPickUpTimestamp: number, index: number) => {
			if (Clock.now() - itemPickUpTimestamp >= this.ITEM_RESPAWN_DURATION) {
				this.itemPickUpTimestamps.splice(index, 1);
				this.grid.generateNewItem(
					this.playerRepo.getAllPlayers().map((player) => player.getPosition()),
					this.isSinglePlayer
				);
			}
		});
	}

	private isMoveRequestValid(moveRequestEvent: MoveRequestEvent): boolean {
		const player = this.findHumanPlayer(moveRequestEvent.playerId);
		if (!player.isWorkingOnQuestion() && player.hasArrived()) {
			const possibleTargetLocations = this.grid.getPossibleMovementFrom(player.getPosition(), player.getMaxMovementDistance());
			if (
				possibleTargetLocations.some(
					(possibleTargetLocation) =>
						possibleTargetLocation.position.x == moveRequestEvent.targetLocation.x &&
						possibleTargetLocation.position.y == moveRequestEvent.targetLocation.y
				)
			) {
				return true;
			}
		}
		return false;
	}

	protected playerPassingByFinishLine(player: Player): boolean {
		const isLapCompleted = super.playerPassingByFinishLine(player);
		if (isLapCompleted) {
			this.context
				.getNamespace()
				.to(this.context.getRoomString())
				.emit(CE.LAP_COMPLETED, <LapCompletedEvent>{ playerId: player.getId() });
		}
		return isLapCompleted;
	}

	private useBook(playerId: string): void {
		try {
			let player = this.findHumanPlayer(playerId);
			let newDifficulty = player.getActiveQuestion().getDifficulty() - 1;
			if (newDifficulty < 1) newDifficulty = 1; //difficulty can only be in range 1 to 6
			this.findQuestionForPlayer(player, player.getInfoForQuestion().language, player.getInfoForQuestion().schoolGrade, newDifficulty).then(
				(question) => {
					player.promptQuestion(question);
					this.context
						.getNamespace()
						.to(player.id)
						.emit(CE.QUESTION_FOUND_WITH_BOOK, <QuestionFoundFromBookEvent>{
							questionDTO: question.getDTO(),
						});
				}
			);
		} catch (err) {
			console.log(err);
		}
	}
}
