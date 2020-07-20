import User from "../../server/data/User";
import PreGame from "./PreGame";

export default class PreGameFactory {
	//Initialized without users when the room is first created
	public static createPreGame(users: User[] = []): PreGame {
		return new PreGame(users);
	}
}
