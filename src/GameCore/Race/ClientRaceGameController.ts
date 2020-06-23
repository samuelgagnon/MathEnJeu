import Player from "./player";
import RaceGameController from "./RaceGameController";
import RaceGameState from "./RaceGameState";

export default class ClientRaceGameController extends RaceGameController {
	constructor(players: Player[] = []) {
		super(players);
	}

	public setGameState(gameState: RaceGameState) {}
}
