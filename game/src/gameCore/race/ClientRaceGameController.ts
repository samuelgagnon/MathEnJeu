import { ItemUsedEvent, MoveRequestEvent } from "../../Communication/Race/dataInterfaces";
import { EVENT_NAMES as e } from "../../Communication/Race/eventNames";
import RaceGameState from "../../Communication/Race/raceGameState";
import { ClientGame } from "../game";
import { ItemType } from "./items/item";
import Player from "./player/player";
import RaceGameController from "./raceGameController";
import RaceGrid from "./raceGrid";

export default class ClientRaceGameController extends RaceGameController implements ClientGame {
	private currentPlayerId: string;
	private playerSocket: SocketIOClient.Socket;
	private isGameFinished: boolean = false;

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

	protected gameFinished(): void {
		//Client does something when game is over. Maybe put a flag up to so the interface can act.
		this.removeSocketEvents();
		this.isGameFinished = true;
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

	public itemUsed(itemType: ItemType, targetPlayerId?: string) {
		if (!targetPlayerId) targetPlayerId = this.currentPlayerId;
		super.itemUsed(itemType, targetPlayerId, this.currentPlayerId);
		this.playerSocket.emit(e.ITEM_USED, <ItemUsedEvent>{ itemType, targetPlayerId, fromPlayerId: this.currentPlayerId });
	}

	public playerMoveRequest(targetLocation: Point): void {
		let now = Date.now();
		super.movePlayerTo(this.currentPlayerId, now, targetLocation);
		this.playerSocket.emit(e.MOVE_REQUEST, <MoveRequestEvent>{
			playerId: this.currentPlayerId,
			startTimestamp: now,
			targetLocation: targetLocation,
		});
	}

	public setGameState(gameState: RaceGameState): void {
		this.timeRemaining = gameState.remainingTime;
		this.players.forEach((player: Player) => {
			player.updateFromPlayerState(gameState.players.find((playerState) => playerState.id === player.id));
		});
		this.grid.updateFromItemStates(gameState.itemsState);
	}

	private handleSocketEvents(): void {
		this.playerSocket.on(e.GAME_UPDATE, (gameState: RaceGameState) => {
			this.setGameState(gameState);
		});
	}

	private removeSocketEvents(): void {
		this.playerSocket.removeEventListener(e.GAME_UPDATE);
	}
}
