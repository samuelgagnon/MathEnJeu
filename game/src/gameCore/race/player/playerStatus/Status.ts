import { StatusState } from "../../../../communication/race/PlayerState";
import Player from "../Player";
import { StatusType } from "./StatusType";

export default abstract class Status {
	protected context: Player;
	protected startTimeStatus: number;

	private readonly MAX_BRAINIAC_MOVEMENT = 7;
	private readonly MAX_MOVEMENT = 6;
	private readonly MIN_MOVEMENT = 1;

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
				this.context.maxPossibleMoveDistance += this.BANANA_MOVE_EFFECT;
				break;

			case StatusType.BrainiacStatus:
				this.context.maxPossibleMoveDistance += this.BRAINIAC_MOVE_EFFECT;
				break;

			default:
				break;
		}

		if (this.context.maxPossibleMoveDistance > this.MAX_BRAINIAC_MOVEMENT && status.getCurrentStatus() === StatusType.BrainiacStatus) {
			this.context.maxPossibleMoveDistance = this.MAX_BRAINIAC_MOVEMENT;
		} else if (this.context.maxPossibleMoveDistance > this.MAX_MOVEMENT && status.getCurrentStatus() !== StatusType.BrainiacStatus) {
			this.context.maxPossibleMoveDistance = this.MAX_MOVEMENT;
		} else if (this.context.maxPossibleMoveDistance < this.MIN_MOVEMENT) {
			this.context.maxPossibleMoveDistance = this.MIN_MOVEMENT;
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
