import Player from "../../GameCore/player";
import RaceGameController from "../../GameCore/Race/RaceGameController";

export default class ClientRaceGameController extends RaceGameController {
	constructor(players: Player[]) {
		super(players);
	}

	public setGameState() {}
}
