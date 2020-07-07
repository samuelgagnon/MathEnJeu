import { ItemUsedEvent } from "../../Communication/Race/dataInterfaces";
import { EVENT_NAMES as e } from "../../Communication/Race/eventNames";
import RaceGameState from "../../Communication/Race/raceGameState";
import { ClientGame } from "../game";
import Player from "./player/player";
import RaceGameController from "./RaceGameController";
import RaceGrid from "./RaceGrid";

export default class ClientRaceGameController extends RaceGameController implements ClientGame {
	private currentPlayerId: string;
	private playerSocket: SocketIOClient.Socket;
	private isGameFinished: boolean = false;

	constructor(
		gameTime: number,
		gameTimeStamp: number,
		grid: RaceGrid,
		players: Player[],
		currentPlayerId: string,
		playerSocket: SocketIOClient.Socket
	) {
		super(gameTime, gameTimeStamp, grid, players);
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

	public itemUsed(itemType: string, targetPlayerId: string, fromPlayerId: string) {
		super.itemUsed(itemType, targetPlayerId, fromPlayerId);
		this.playerSocket.emit(e.ITEM_USED, <ItemUsedEvent>{ itemType, targetPlayerId, fromPlayerId });
	}

	public setGameState(gameState: RaceGameState): void {
		this.grid.updateFromItemStates(gameState.itemsState);
		this.players.forEach((player: Player) => {
			player.updateFromPlayerState(gameState.players.find((playerState) => playerState.id === player.id));
		});
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
