import User from "../../server/data/user";
import gameFSM from "./gameFSM";

export default interface State {
	setContext(context: gameFSM): void;
	userJoined(user: User): void;
	userLeft(user: User): void;
}
