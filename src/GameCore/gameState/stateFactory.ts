import ServerRaceGameController from "../Race/ServerRaceGameController";
import PreGame from "./preGame";

export default class StateFactory {
	public static createPreGame(): PreGame {
		return new PreGame();
	}

	public static createRaceGame(gameId: string): ServerRaceGameController {
		return new ServerRaceGameController(gameId);
	}
}
