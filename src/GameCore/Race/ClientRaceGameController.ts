import { ClientGame } from "../../GameCore/game";
import RaceGameController from "../../GameCore/Race/RaceGameController";
import RaceGameState from "../../GameCore/Race/raceGameState";

export default class ClientRaceGameController extends RaceGameController implements ClientGame {
	constructor() {
		super();
	}

	public setGameState(gameState: RaceGameState) {}

	public update(): void {}
}
