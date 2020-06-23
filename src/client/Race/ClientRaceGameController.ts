import RaceGameController from "../../GameCore/Race/RaceGameController";
import RaceGameState from "../../GameCore/Race/raceGameState";

export default class ClientRaceGameController extends RaceGameController {
	constructor() {
		/**
		 * TODO: We need to figure out if this controller has to implement the Game interface or not
		 * Maybe have 2 seperate interfaces for the game client and game server
		 */
		super("");
	}

	public setGameState(gameState: RaceGameState) {}
}
