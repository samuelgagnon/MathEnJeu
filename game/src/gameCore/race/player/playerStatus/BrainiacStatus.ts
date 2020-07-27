import { StatusState } from "../../../../communication/race/PlayerState";
import Status from "./Status";
import StatusFactory from "./StatusFactory";
import { StatusType } from "./StatusType";

export default class BrainiacStatus extends Status {
	private readonly DEFAULT_MAX_TIME_STATUS: number = 60000; //milliseconds

	constructor(startTimeStamp: number) {
		super();
		this.startTimeStatus = startTimeStamp;
	}

	public update(): void {
		this.setToNormalStatusIfCurrentStatusIsOver();
	}

	public updateFromState(statusState: StatusState): void {
		switch (statusState.statusType) {
			case StatusType.BananaStatus:
				this.transitionTo(StatusFactory.create(StatusType.BananaStatus, statusState.statusTimestamp));
				break;
			case StatusType.BrainiacStatus:
				this.startTimeStatus = statusState.statusTimestamp;
				break;
			case StatusType.NormalStatus:
				this.transitionTo(StatusFactory.create(StatusType.NormalStatus));
				break;
		}
	}

	public activateBananaStatus(): void {
		this.transitionTo(StatusFactory.create(StatusType.BananaStatus));
	}

	public activateBrainiacStatus(): void {
		this.startTimeStatus = Date.now();
	}

	private setToNormalStatusIfCurrentStatusIsOver() {
		if (Date.now() - this.startTimeStatus > this.DEFAULT_MAX_TIME_STATUS) {
			this.transitionTo(StatusFactory.create(StatusType.NormalStatus));
		}
	}

	public getRemainingTime(): number {
		return this.DEFAULT_MAX_TIME_STATUS - (Date.now() - this.startTimeStatus);
	}

	public getCurrentStatus(): StatusType {
		return StatusType.BrainiacStatus;
	}

	protected transitionTo(status: Status): void {
		this.context.addToMoveDistance(this.BRAINIAC_MOVE_EFFECT);
		super.transitionTo(status);
	}
}
