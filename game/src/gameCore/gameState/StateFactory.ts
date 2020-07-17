import PreGame from "./PreGame";

export default class PreGameFactory {
	public static createPreGame(): PreGame {
		return new PreGame();
	}
}
