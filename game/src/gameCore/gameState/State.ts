import gameFSM from "../../server/rooms/Room";
import User from "../../server/rooms/User";

export enum GameState {
	PreGame = "PreGame",
	RaceGame = "RaceGame",
	FillFulled = "FillFulled",
}

export default interface State {
	setContext(context: gameFSM): void;
	userJoined(user: User): void;
	setFullFilled(): void;
	setPreGame(): void;
	userLeft(user: User): void;
	getStateType(): GameState;
}
