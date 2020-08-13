import { Socket } from "socket.io";
import BufferedInput from "../../communication/race/BufferedInput";
import {
	BookUsedEvent,
	GameEndEvent,
	GameStartEvent,
	ItemUsedEvent,
	MoveRequestEvent,
	PlayerEndState,
	PlayerLeftEvent,
	QuestionAnsweredEvent,
	QuestionFoundEvent,
	QuestionFoundFromBookEvent,
	StartingRaceGridInfo,
} from "../../communication/race/DataInterfaces";
import { CLIENT_EVENT_NAMES as CE, SERVER_EVENT_NAMES as SE } from "../../communication/race/EventNames";
import PlayerState from "../../communication/race/PlayerState";
import RaceGameState from "../../communication/race/RaceGameState";
import QuestionRepository from "../../server/data/QuestionRepository";
import User from "../../server/data/User";
import { getObjectValues } from "../../utils/Utils";
import { ServerGame } from "../Game";
import GameFSM from "../gameState/GameFSM";
import State from "../gameState/State";
import PreGameFactory from "../gameState/StateFactory";
import RaceGrid from "./grid/RaceGrid";
import Move from "./Move";
import Player from "./player/Player";
import { Question } from "./question/Question";
import RaceGameController from "./RaceGameController";

export default class ServerRaceGameController extends RaceGameController implements State, ServerGame {
	private readonly ITEM_RESPAWN_DURATION: number = 30 * 1000;
	private context: GameFSM;
	private inputBuffer: BufferedInput[] = [];
	private isGameStarted: boolean = false;
	private gameId: string;
	private itemPickUpTimestamps: Number[] = [];
	private questionRepo: QuestionRepository;

	constructor(gameTime: number, grid: RaceGrid, players: Player[], users: User[], gameId: string, questionRepo: QuestionRepository) {
		//The server has the truth regarding the start timestamp.
		super(gameTime, Date.now(), grid, players);
		this.gameId = gameId;
		this.questionRepo = questionRepo;
		this.handleAllUsersSocketEvents(users);
	}

	public setContext(context: GameFSM): void {
		this.context = context;
	}

	public getGameId(): string {
		return this.gameId;
	}

	private emitStartGameEvent(): void {
		this.isGameStarted = true;
		this.context
			.getNamespace()
			.to(this.context.getRoomString())
			.emit(CE.GAME_START, <GameStartEvent>{
				gameTime: this.gameTime,
				gameStartTimeStamp: this.gameStartTimeStamp,
				grid: <StartingRaceGridInfo>{
					width: this.grid.getWidth(),
					height: this.grid.getHeight(),
					nonWalkablePositions: this.grid.getNonWalkablePositions(),
					startingPositions: this.grid.getStartingPositions(),
					finishLinePositions: this.grid.getFinishLinePositions(),
					itemStates: this.grid.getItemsState(),
				},
				players: this.getPlayersState(),
			});
	}

	private getGameState(): RaceGameState {
		let gameState: RaceGameState = { timeStamp: 0, itemsState: [], players: [], remainingTime: this.timeRemaining };
		gameState.itemsState = this.grid.getItemsState();
		this.players.forEach((player: Player) => {
			gameState.players.push(player.getPlayerState());
		});

		gameState.timeStamp = Date.now();
		return gameState;
	}

	public update(): void {
		if (!this.isGameStarted) this.emitStartGameEvent();
		this.resolveInputs();
		super.update();
		if (this.timeRemaining <= 0) this.gameFinished();
		this.context.getNamespace().to(this.context.getRoomString()).emit(CE.GAME_UPDATE, this.getGameState());
	}

	protected gameFinished(): void {
		const playerEndStates: PlayerEndState[] = this.getPlayersState().map((playerState) => {
			return { playerId: playerState.id, points: playerState.points, name: playerState.name };
		});
		this.context
			.getNamespace()
			.to(this.context.getRoomString())
			.emit(CE.GAME_END, <GameEndEvent>{ playerEndStates: playerEndStates });
		this.removeAllUsersSocketEvents();
		this.context.gameFinished(this);
		this.context.transitionTo(PreGameFactory.createPreGame(this.context.getUsers()));
	}

	public userJoined(user: User): void {
		this.handleSocketEvents(user.socket);
	}

	public userLeft(user: User): void {
		this.removePlayer(user.userId);
		this.context
			.getNamespace()
			.to(this.context.getRoomString())
			.emit(CE.PLAYER_LEFT, <PlayerLeftEvent>{ playerId: user.userId });
		this.removeSocketEvents(user.socket);
	}

	private handleSocketEvents(socket: Socket): void {
		socket.on(SE.ITEM_USED, (data: ItemUsedEvent) => {
			const newInput: BufferedInput = { eventType: SE.ITEM_USED, data: data };
			this.inputBuffer.push(newInput);
		});

		socket.on(SE.MOVE_REQUEST, (data: MoveRequestEvent) => {
			const newInput: BufferedInput = { eventType: SE.MOVE_REQUEST, data: data };
			this.inputBuffer.push(newInput);
		});

		socket.on(SE.QUESTION_ANSWERED, (data: QuestionAnsweredEvent) => {
			const lag = data.clientTimestamp - Date.now();
			const newData: QuestionAnsweredEvent = {
				isAnswerCorrect: data.isAnswerCorrect,
				playerId: data.playerId,
				clientTimestamp: data.clientTimestamp,
				startTimestamp: data.startTimestamp + lag,
				targetLocation: data.targetLocation,
			};
			const newInput: BufferedInput = { eventType: SE.QUESTION_ANSWERED, data: newData };
			this.inputBuffer.push(newInput);
		});

		socket.on(SE.BOOK_USED, (data: BookUsedEvent) => {
			const newInput: BufferedInput = { eventType: SE.BOOK_USED, data: data };
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

	public resolveInputs(): void {
		this.inputBuffer.forEach((input: BufferedInput) => {
			let inputData: any = input.data;
			let player: Player;
			switch (input.eventType) {
				case SE.ITEM_USED:
					try {
						this.itemUsed((<ItemUsedEvent>inputData).itemType, (<ItemUsedEvent>inputData).targetPlayerId, (<ItemUsedEvent>inputData).fromPlayerId);
					} catch (error) {
						console.log(error);
					}
					break;

				case SE.MOVE_REQUEST:
					try {
						player = this.findPlayer((<MoveRequestEvent>inputData).playerId);
						player.setIsAnsweringQuestion(true);
						this.sendQuestionToPlayer(
							player.getInfoForQuestion().language,
							player.getInfoForQuestion().schoolGrade,
							player,
							(<MoveRequestEvent>inputData).targetLocation
						);
					} catch (err) {
						console.log(err);
					}
					break;

				case SE.BOOK_USED:
					try {
						player = this.findPlayer((<BookUsedEvent>inputData).playerId);
						const movement = Move.getTaxiCabDistance(player.getPosition(), (<BookUsedEvent>inputData).targetLocation) - 1; //for now reduce difficulty only by 1;
						this.findQuestionForPlayer(player.getInfoForQuestion().language, player.getInfoForQuestion().schoolGrade, movement).then((question) => {
							this.context
								.getNamespace()
								.to(player.id)
								.emit(CE.QUESTION_FOUND_WITH_BOOK, <QuestionFoundFromBookEvent>{
									questionDTO: question.getDTO(),
								});
						});
					} catch (err) {
						console.log(err);
					}
					break;

				case SE.QUESTION_ANSWERED:
					super.playerAnsweredQuestion(
						(<QuestionAnsweredEvent>inputData).isAnswerCorrect,
						(<QuestionAnsweredEvent>inputData).targetLocation,
						(<QuestionAnsweredEvent>inputData).playerId,
						(<QuestionAnsweredEvent>inputData).startTimestamp
					);
					break;

				default:
					break;
			}
		});
		this.inputBuffer = [];
	}

	private async findQuestionForPlayer(language: string, schoolGrade: number, movement: number): Promise<Question> {
		const questionIdArray = await this.questionRepo.getQuestionsIdByDifficulty(language, schoolGrade, movement);
		console.log(`language: ${language}, schoolGrade: ${schoolGrade}, movement: ${movement}`);
		//temporary to limit the number of png files to load
		const newArray = questionIdArray.filter((id) => id < 1000);
		const randomPosition = Math.floor(Math.random() * newArray.length);
		console.log(newArray);
		return this.questionRepo.getQuestionById(questionIdArray[randomPosition], language, schoolGrade);
	}

	private sendQuestionToPlayer(language: string, schoolGrade: number, player: Player, targetLocation: Point): void {
		this.findQuestionForPlayer(language, schoolGrade, player.getDifficulty(targetLocation))
			.then((question) => {
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

	private getPlayersState(): PlayerState[] {
		let playersState: PlayerState[] = [];
		this.players.forEach((player: Player) => {
			playersState.push(player.getPlayerState());
		});
		return playersState;
	}

	protected handleItemCollisions(): void {
		this.players.forEach((player) => {
			const itemPickedUp: boolean = this.grid.handleItemCollision(player);
			if (itemPickedUp) {
				this.itemPickUpTimestamps.push(Date.now());
			}
		});
	}

	private handleItemsRespawn(): void {
		this.itemPickUpTimestamps.forEach((itemPickUpTimestamp: number, index: number) => {
			if (Date.now() - itemPickUpTimestamp >= this.ITEM_RESPAWN_DURATION) {
				this.itemPickUpTimestamps.splice(index, 1);
				this.grid.generateNewItem();
			}
		});
	}
}
