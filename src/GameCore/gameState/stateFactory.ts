import PreGame from "./preGame";
import RaceGame from "./raceGame";
import { v4 as uuidv4 } from "uuid";

export default class StateFactory {
	public static createPreGame(): PreGame {
		return new PreGame();
	}

	public static createRaceGame(): RaceGame {
		const gameId: string = uuidv4();
		return new RaceGame(gameId);
	}
}
