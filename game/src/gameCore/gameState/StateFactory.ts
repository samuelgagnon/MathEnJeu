import PreGame from "./preGame";

export default class PreGameFactory {
	public static createPreGame(): PreGame {
		return new PreGame();
	}
}
