import { StatusState } from "../../../../communication/race/PlayerState";
import Player from "../Player";
import { StatusType } from "./StatusType";

export default abstract class Status {
	protected context: Player;
	protected startTimeStatus: number;

	protected readonly BANANA_MOVE_EFFECT = -2;
	protected readonly BRAINIAC_MOVE_EFFECT = 1;

	public setContext(context: Player) {
		this.context = context;
	}

	public getStartTimeStatus(): number {
		return this.startTimeStatus;
	}

	protected transitionTo(status: Status): void {
		switch (status.getCurrentStatus()) {
			case StatusType.BananaStatus:
				this.context.addToMoveDistance(this.BANANA_MOVE_EFFECT, status.getCurrentStatus());
				break;

			case StatusType.BrainiacStatus:
				this.context.addToMoveDistance(this.BRAINIAC_MOVE_EFFECT, status.getCurrentStatus());
				break;

			default:
				break;
		}

		this.context.transitionTo(status);
	}

	public abstract getCurrentStatus(): StatusType;

	public abstract update(): void;

	public abstract updateFromState(statusState: StatusState): void;

	public abstract activateBananaStatus(): void;

	public abstract activateBrainiacStatus(): void;

	public abstract getRemainingTime(): number;
}
