import RaceGameState from "../../Communication/Race/raceGameState";
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

	public update(): void {}

	public setGameState(gameState: RaceGameState) {}

	public itemUsedOn() {}
}
