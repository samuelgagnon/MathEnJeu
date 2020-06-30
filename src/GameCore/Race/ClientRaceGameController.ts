import { ClientGame } from "../game";
import Player from "./player/player";
import RaceGameController from "./RaceGameController";
import RaceGameState from "./raceGameState";
import RaceGrid from "./RaceGrid";

export default class ClientRaceGameController extends RaceGameController implements ClientGame {
	private currentPlayerId: string;
	constructor(gameTimeStamp: number, grid: RaceGrid, players: Player[], currentPlayerId: string) {
		super(gameTimeStamp, grid, players);
		this.currentPlayerId = currentPlayerId;
	}

	public update(): void {}

	public setGameState(gameState: RaceGameState) {}
}
