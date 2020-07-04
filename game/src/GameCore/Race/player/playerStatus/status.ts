import Player from "../player";
import { StatusType } from "./statusType";

export default abstract class Status {
	protected context: Player;

	public setContext(context: Player) {
		this.context = context;
	}

	public abstract update(): void;

	public abstract getCurrentStatus(): StatusType;

	public abstract activateBananaStatus(): void;

	public abstract activateBrainiacStatus(): void;
}
