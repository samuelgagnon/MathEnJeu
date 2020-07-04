import BrainiacStatus from "./brainiacStatus";
import NormalStatus from "./normalStatus";
import Status from "./status";
import { StatusType } from "./statusType";

export default class BananaStatus extends Status {
	private readonly DEFAULT_MAX_TIME_STATUS: Number = 90000; //milliseconds

	constructor() {
		super();
		this.context.setStatusTimeStamp(Date.now());
	}

	public update(): void {
		this.setToNormalStatusIfCurrentStatusIsOver();
	}

	public activateBananaStatus(): void {
		this.context.setStatusTimeStamp(Date.now());
	}

	public activateBrainiacStatus(): void {
		this.context.transitionTo(new BrainiacStatus());
	}

	private setToNormalStatusIfCurrentStatusIsOver() {
		if (Date.now() - this.context.getStatusTimeStamp() > this.DEFAULT_MAX_TIME_STATUS) {
			this.context.transitionTo(new NormalStatus());
		}
	}

	public getCurrentStatus(): StatusType {
		return StatusType.BananaStatus;
	}
}
