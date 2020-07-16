import { StatusState } from "../../../../Communication/Race/playerState";
import Status from "./status";
import StatusFactory from "./statusFactory";
import { StatusType } from "./statusType";

export default class BananaStatus extends Status {
	private readonly DEFAULT_MAX_TIME_STATUS: number = 90000; //milliseconds

	constructor(startTimestamp: number) {
		super();
		this.startTimeStatus = startTimestamp;
	}

	public update(): void {
		this.setToNormalStatusIfCurrentStatusIsOver();
	}

	public updateFromState(statusState: StatusState): void {
		switch (statusState.statusType) {
			case StatusType.BananaStatus:
				this.startTimeStatus = statusState.statusTimestamp;
				break;
			case StatusType.BrainiacStatus:
				this.context.transitionTo(StatusFactory.create(StatusType.BrainiacStatus, statusState.statusTimestamp));
				break;
			case StatusType.NormalStatus:
				this.context.transitionTo(StatusFactory.create(StatusType.NormalStatus));
				break;
		}
	}

	public activateBananaStatus(): void {
		this.startTimeStatus = Date.now();
	}

	public activateBrainiacStatus(): void {
		this.context.transitionTo(StatusFactory.create(StatusType.BrainiacStatus));
	}

	private setToNormalStatusIfCurrentStatusIsOver() {
		if (Date.now() - this.startTimeStatus > this.DEFAULT_MAX_TIME_STATUS) {
			this.context.transitionTo(StatusFactory.create(StatusType.NormalStatus));
		}
	}

	public getRemainingTime(): number {
		return this.DEFAULT_MAX_TIME_STATUS - (Date.now() - this.startTimeStatus);
	}

	public getCurrentStatus(): StatusType {
		return StatusType.BananaStatus;
	}
}
