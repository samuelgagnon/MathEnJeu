import { ItemUsedEvent } from "../../Communication/Race/dataInterfaces";
import { EVENT_NAMES as e } from "../../Communication/Race/eventNames";
import { ClientGame } from "../game";
import Player from "./player/player";
import RaceGameController from "./RaceGameController";
import RaceGrid from "./RaceGrid";

export default class ClientRaceGameController extends RaceGameController implements ClientGame {
	private currentPlayerId: string;
	private playerSocket: SocketIOClient.Socket;

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
	}

	public update(): void {
		super.update();
	}

	protected gameFinished(): void {
		//Client does something when game is over. Maybe put a flag up to so the interface can act.
	}

	public itemUsed(itemType: string, targetPlayerId: string, fromPlayerId: string) {
		super.itemUsed(itemType, targetPlayerId, fromPlayerId);
		this.playerSocket.emit(e.ITEM_USED, <ItemUsedEvent>{ itemType, targetPlayerId, fromPlayerId });
	}
}
