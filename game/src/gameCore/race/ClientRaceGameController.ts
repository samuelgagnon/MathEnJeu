import { ItemUsedEvent, MoveRequestEvent, PlayerLeftEvent, QuestionAnsweredEvent } from "../../communication/race/DataInterfaces";
import { CLIENT_EVENT_NAMES as CE, SERVER_EVENT_NAMES as SE } from "../../communication/race/EventNames";
import RaceGameState from "../../communication/race/RaceGameState";
import { getObjectValues } from "../../utils/Utils";
import { ClientGame } from "../Game";
import RaceGrid, { PossiblePositions } from "./grid/RaceGrid";
import { ItemType } from "./items/Item";
import Player from "./player/Player";
import RaceGameController from "./RaceGameController";

export default class ClientRaceGameController extends RaceGameController implements ClientGame {
	private currentPlayerId: string;
	private playerSocket: SocketIOClient.Socket;
	private readonly MAX_TIME_DIFFERENCE = 1500; //milliseconds

	constructor(
		gameTime: number,
		gameStartTimeStamp: number,
		grid: RaceGrid,
		players: Player[],
		currentPlayerId: string,
		playerSocket: SocketIOClient.Socket
	) {
		super(gameTime, gameStartTimeStamp, grid, players);
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
		return this.players;
	}

	public getGrid(): RaceGrid {
		return this.grid;
	}

	public getCurrentPlayer(): Player {
		return this.findPlayer(this.currentPlayerId);
	}

	public getCurrentPlayerSocket(): SocketIOClient.Socket {
		return this.playerSocket;
	}

	public itemUsed(itemType: ItemType, targetPlayerId?: string) {
		if (!targetPlayerId) targetPlayerId = this.currentPlayerId;
		super.itemUsed(itemType, targetPlayerId, this.currentPlayerId);
		this.playerSocket.emit(SE.ITEM_USED, <ItemUsedEvent>{ itemType, targetPlayerId, fromPlayerId: this.currentPlayerId });
	}

	public playerMoveRequest(targetLocation: Point, language: string, schoolGrade: number): void {
		this.playerSocket.emit(SE.MOVE_REQUEST, <MoveRequestEvent>{
			targetLocation: targetLocation,
			playerId: this.currentPlayerId,
			language: language,
			schoolGrade: schoolGrade,
		});
	}

	public playerAnsweredQuestionCorrectly(targetLocation: Point): void {
		let now = Date.now();
		super.movePlayerTo(this.currentPlayerId, now, targetLocation);
		this.playerSocket.emit(SE.QUESTION_ANSWERED, <QuestionAnsweredEvent>{
			playerId: this.currentPlayerId,
			startTimestamp: now,
			targetLocation: targetLocation,
		});
	}

	public setGameState(gameState: RaceGameState): void {
		const lag = gameState.timeStamp - Date.now();
		//Ajusting client game time only if it has a difference of 1.5 seconds (1500 millisecondes)
		if (Math.abs(this.timeRemaining - gameState.remainingTime) > this.MAX_TIME_DIFFERENCE) this.timeRemaining = gameState.remainingTime + lag;
		this.players.forEach((player: Player) => {
			player.updateFromPlayerState(gameState.players.find((playerState) => playerState.id === player.id));
		});
		this.grid.updateFromItemStates(gameState.itemsState, lag);
	}

	public getPossiblePlayerMovement(position: Point): PossiblePositions[] {
		const currentPlayer = this.getCurrentPlayer();
		return this.grid.getPossibleMovementFrom(position, currentPlayer.getMaxMovementDistance());
	}

	private handleSocketEvents(): void {
		this.playerSocket.on(CE.GAME_UPDATE, (gameState: RaceGameState) => {
			this.setGameState(gameState);
		});

		this.playerSocket.on(CE.PLAYER_LEFT, (data: PlayerLeftEvent) => {
			this.removePlayer(data.playerId);
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
