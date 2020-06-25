import { ClientGame } from "../game";
import RaceGameController from "./RaceGameController";
import RaceGameState from "./raceGameState";

export default class ClientRaceGameController extends RaceGameController implements ClientGame {
	constructor() {
		super();
	}

	public update(): void {}

	public setGameState(gameState: RaceGameState) {}
}
