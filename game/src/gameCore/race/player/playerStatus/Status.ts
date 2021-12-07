import { StatusState } from "../../../../communication/race/PlayerState";
import Player from "../Player";
import { StatusType } from "./StatusType";
import StatusFactory from "./StatusFactory";

export default abstract class Status {
	protected context: Player;
	protected startTimeStatus: number;

	protected readonly BANANA_MOVE_EFFECT = -2;
	protected readonly BRAINIAC_MOVE_EFFECT = 2;
	protected readonly NORMAL = 3;

	public setContext(context: Player) {
		this.context = context;
	}

	public getStartTimeStatus(): number {
		return this.startTimeStatus;
	}

	protected transitionTo(status: Status): void {
		switch (status.getCurrentStatus()) {
			case StatusType.BananaStatus:
				if (this.context.getCurrentStatus() === StatusType.BrainiacStatus) {
					this.context.setMaxMovementDistance(this.NORMAL);
					this.context.transitionTo(StatusFactory.create(StatusType.NormalStatus));
				} else {
					this.context.setMaxMovementDistance(1);
					this.context.transitionTo(status);
				}
				break;

			case StatusType.BrainiacStatus:
				if (this.context.getCurrentStatus() === StatusType.BananaStatus) {
					this.context.setMaxMovementDistance(this.NORMAL);
					this.context.transitionTo(StatusFactory.create(StatusType.NormalStatus));
				} else {
					this.context.addToMoveDistance(this.BRAINIAC_MOVE_EFFECT, status.getCurrentStatus());
					this.context.transitionTo(status);
				}
				break;

			case StatusType.NormalStatus:
				this.context.setMaxMovementDistance(this.NORMAL);
				this.context.transitionTo(status);
				break;

			default:
				break;
		}
	}

	public abstract getCurrentStatus(): StatusType;

	public abstract update(): void;

	public abstract updateFromState(statusState: StatusState): void;

	public abstract activateBananaStatus(): void;

	public abstract activateBrainiacStatus(): void;

	public abstract getRemainingTime(): number;
}
