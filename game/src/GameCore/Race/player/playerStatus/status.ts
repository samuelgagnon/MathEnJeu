import { StatusState } from "../../../../Communication/Race/playerState";
import Player from "../player";
import { StatusType } from "./statusType";

export default abstract class Status {
	protected context: Player;
	protected startTimeStatus: number;

	public setContext(context: Player) {
		this.context = context;
	}

	public getStartTimeStatus(): number {
		return this.startTimeStatus;
	}

	public abstract getCurrentStatus(): StatusType;

	public abstract update(): void;

	public abstract updateFromState(statusState: StatusState): void;

	public abstract activateBananaStatus(): void;

	public abstract activateBrainiacStatus(): void;

	public abstract getRemainingTime(): number;
}
