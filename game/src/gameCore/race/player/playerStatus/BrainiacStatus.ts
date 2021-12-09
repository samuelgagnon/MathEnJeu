import { StatusState } from "../../../../communication/race/PlayerState";
import { Clock } from "../../../clock/Clock";
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
				this.transitionTo(StatusFactory.create(StatusType.NormalStatus));
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
		this.startTimeStatus = Clock.now();
	}

	private setToNormalStatusIfCurrentStatusIsOver() {
		if (Clock.now() - this.startTimeStatus > this.DEFAULT_MAX_TIME_STATUS) {
			this.transitionTo(StatusFactory.create(StatusType.NormalStatus));
		}
	}

	public getRemainingTime(): number {
		return this.DEFAULT_MAX_TIME_STATUS - (Clock.now() - this.startTimeStatus);
	}

	public getCurrentStatus(): StatusType {
		return StatusType.BrainiacStatus;
	}

	protected transitionTo(status: Status): void {
		//removing the brainiac bonus movement
		if (status.getCurrentStatus() === StatusType.NormalStatus) {
			this.context.setMaxMovementDistance(this.NORMAL);
		}
		super.transitionTo(status);
	}
}
