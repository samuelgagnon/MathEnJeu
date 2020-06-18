import gameFSM from "./gameFSM";

export default abstract class State {
	protected context: gameFSM;

	public setContext(context: gameFSM) {
		this.context = context;
	}
}
