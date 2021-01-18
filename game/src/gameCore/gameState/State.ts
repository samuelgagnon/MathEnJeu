import User from "../../server/data/User";
import gameFSM from "../../server/rooms/Room";

export enum GameState {
	PreGame = "PreGame",
	RaceGame = "RaceGame",
}

export default interface State {
	setContext(context: gameFSM): void;
	userJoined(user: User): void;
	userLeft(user: User): void;
	getStateType(): GameState;
}
