import Player from "../player";

export default abstract class Status {
	protected context: Player;

	public setContext(context: Player) {
		this.context = context;
	}

	public abstract update(): void;

	public abstract activateBananaStatus(): void;

	public abstract activateBrainiacStatus(): void;
}
