import { BookUsedEvent, ItemUsedEvent, MoveRequestEvent, PlayerLeftEvent, QuestionAnsweredEvent } from "../../communication/race/DataInterfaces";
import { CLIENT_EVENT_NAMES as CE, SERVER_EVENT_NAMES as SE } from "../../communication/race/EventNames";
import RaceGameState from "../../communication/race/RaceGameState";
import { getObjectValues } from "../../utils/Utils";
import { Clock } from "../clock/Clock";
import { ClientGame } from "../Game";
import RaceGrid, { PossiblePositions } from "./grid/RaceGrid";
import { ItemType } from "./items/Item";
import Player from "./player/Player";
import { PlayerRepository } from "./player/playerRepository/PlayerRepository";
import { Answer } from "./question/Answer";
import RaceGameController from "./RaceGameController";

export default class ClientRaceGameController extends RaceGameController implements ClientGame {
	private currentPlayerId: string;
	private playerSocket: SocketIOClient.Socket;
	private lastServerUpdateTimestamp: number = 0;
	private readonly MAX_TIME_DIFFERENCE = 1500; //milliseconds
	private readonly NO_MORE_SERVER_UPDATE_THRESHOLD = 1000;

	constructor(
		gameTime: number,
		gameStartTimeStamp: number,
		grid: RaceGrid,
		playerRepo: PlayerRepository,
		currentPlayerId: string,
		playerSocket: SocketIOClient.Socket
	) {
		super(gameTime, gameStartTimeStamp, grid, playerRepo);
		this.currentPlayerId = currentPlayerId;
		this.playerSocket = playerSocket;
		this.handleSocketEvents();
	}

	public update(): void {
		super.update();
	}

	public gameFinished(): void {
		this.removeSocketEvents();
	}

	public getPlayers(): Player[] {
		return this.playerRepo.getAllPlayers();
	}

	public getGrid(): RaceGrid {
		return this.grid;
	}

	public getCurrentPlayer(): Player {
		return this.playerRepo.findPlayer(this.currentPlayerId);
	}

	public getCurrentPlayerSocket(): SocketIOClient.Socket {
		return this.playerSocket;
	}

	public itemUsed(itemType: ItemType, targetPlayerId?: string) {
		if (!targetPlayerId) targetPlayerId = this.currentPlayerId;
		super.itemUsed(itemType, targetPlayerId, this.currentPlayerId);
		this.playerSocket.emit(SE.ITEM_USED, <ItemUsedEvent>{ itemType, targetPlayerId, fromPlayerId: this.currentPlayerId });
	}

	public playerMoveRequest(targetLocation: Point): void {
		this.playerSocket.emit(SE.MOVE_REQUEST, <MoveRequestEvent>{
			targetLocation: targetLocation,
			playerId: this.currentPlayerId,
		});
	}

	public clientPlayerAnswersQuestion(answer: Answer, targetLocation: Point): void {
		const answerTimestamp = Clock.now();
		this.playerSocket.emit(SE.QUESTION_ANSWERED, <QuestionAnsweredEvent>{
			playerId: this.currentPlayerId,
			clientTimestamp: Clock.now(),
			answerTimestamp: answerTimestamp,
			targetLocation: targetLocation,
			answer: answer.getDTO(),
		});
	}

	public setGameState(gameState: RaceGameState): void {
		const lag = gameState.timeStamp - Clock.now();
		//Ajusting client game time only if it has a difference of 1.5 seconds (1500 millisecondes)
		if (Math.abs(this.timeRemaining - gameState.remainingTime) > this.MAX_TIME_DIFFERENCE) this.timeRemaining = gameState.remainingTime + lag;
		this.playerRepo.getAllPlayers().forEach((player: Player) => {
			player.updateFromPlayerState(
				gameState.players.find((playerState) => playerState.id === player.id),
				lag
			);
		});
		this.grid.updateFromItemStates(gameState.itemsState);
		this.lastServerUpdateTimestamp = Clock.now();
	}

	public hasServerStoppedSendingUpdates() {
		return Clock.now() - this.lastServerUpdateTimestamp > this.NO_MORE_SERVER_UPDATE_THRESHOLD;
	}

	public getPossibleCurrentPlayerMovement(position: Point): PossiblePositions[] {
		const currentPlayer = this.getCurrentPlayer();
		return this.grid.getPossibleMovementFrom(position, currentPlayer.getMaxMovementDistance());
	}

	private handleSocketEvents(): void {
		this.playerSocket.on(CE.GAME_UPDATE, (gameState: RaceGameState) => {
			this.setGameState(gameState);
		});

		this.playerSocket.on(CE.PLAYER_LEFT, (data: PlayerLeftEvent) => {
			this.playerRepo.removePlayer(data.playerId);
		});
	}

	public bookUsed(questionDifficulty: number, targetLocation: Point): void {
		this.playerSocket.emit(SE.BOOK_USED, <BookUsedEvent>{
			playerId: this.currentPlayerId,
			targetLocation: targetLocation,
			questionDifficulty: questionDifficulty,
		});
	}

	private removeSocketEvents(): void {
		const events = getObjectValues(CE);
		for (var key in events) {
			if (events.hasOwnProperty(key)) {
				this.playerSocket.removeEventListener(events[key]);
			}
		}
	}
}
