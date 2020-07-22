import User from "../../server/data/User";
import gameFSM from "./GameFSM";

export default interface State {
	setContext(context: gameFSM): void;
	userJoined(user: User): void;
	userLeft(user: User): void;
}
