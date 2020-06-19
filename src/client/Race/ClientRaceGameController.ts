import Player from "../../GameCore/player";
import RaceGameController from "../../GameCore/Race/RaceGameController";
import RaceGameState from "../../GameCore/Race/RaceGameState";

export default class ClientRaceGameController extends RaceGameController {
	constructor(players: Player[] = []) {
		super(players);
	}

	public setGameState(gameState: RaceGameState) {}
}
