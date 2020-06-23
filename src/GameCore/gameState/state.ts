import gameFSM from "./gameFSM";
import User from "../../server/data/user";

export default abstract class State {
	protected context: gameFSM;

	public setContext(context: gameFSM) {
		this.context = context;
	}

	abstract userJoined(user: User): void;

	abstract userLeft(user: User): void;
}
