import PlayerFSM from "../playerFSM";

export default abstract class Status {
	protected context: PlayerFSM;
	protected statusStartTimeStamp: number = Date.now(); //TODO: Initialize here or in constructor ? Verify behavior in an absctract class

	public setContext(context: PlayerFSM) {
		this.context = context;
	}

	public abstract bananaReceived(): void;
	public abstract brainiacActivated(): void;
}
