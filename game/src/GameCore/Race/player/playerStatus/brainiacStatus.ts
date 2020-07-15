import { StatusState } from "../../../../Communication/Race/playerState";
import Status from "./status";
import StatusFactory from "./statusFactory";
import { StatusType } from "./statusType";

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
				this.context.transitionTo(StatusFactory.create(StatusType.BananaStatus, statusState.statusTimestamp));
				break;
			case StatusType.BrainiacStatus:
				this.startTimeStatus = statusState.statusTimestamp;
				break;
			case StatusType.NormalStatus:
				this.context.transitionTo(StatusFactory.create(StatusType.NormalStatus));
				break;
		}
	}

	public activateBananaStatus(): void {
		this.context.transitionTo(StatusFactory.create(StatusType.BananaStatus));
	}

	public activateBrainiacStatus(): void {
		this.startTimeStatus = Date.now();
	}

	private setToNormalStatusIfCurrentStatusIsOver() {
		if (Date.now() - this.startTimeStatus > this.DEFAULT_MAX_TIME_STATUS) {
			this.context.transitionTo(StatusFactory.create(StatusType.NormalStatus));
		}
	}

	public getRemainingTime(): string {
		return Math.floor((this.DEFAULT_MAX_TIME_STATUS - (Date.now() - this.startTimeStatus)) / 1000).toString();
	}

	public getCurrentStatus(): StatusType {
		return StatusType.BrainiacStatus;
	}
}
