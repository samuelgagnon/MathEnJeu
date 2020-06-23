import PreGame from "./preGame";
import RaceGame from "./raceGame";

export default class StateFactory {
	public static createPreGame(): PreGame {
		return new PreGame();
	}

	public static createRaceGame(gameId: string): RaceGame {
		return new RaceGame(gameId);
	}
}
