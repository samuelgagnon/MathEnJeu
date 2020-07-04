import BananaStatus from "./bananaStatus";
import NormalStatus from "./normalStatus";
import Status from "./status";
import { StatusType } from "./statusType";

export default class BrainiacStatus extends Status {
	private readonly DEFAULT_MAX_TIME_STATUS: Number = 60000; //milliseconds

	constructor() {
		super();
		this.context.setStatusTimeStamp(Date.now());
	}

	public update(): void {
		this.setToNormalStatusIfCurrentStatusIsOver();
	}

	public activateBananaStatus(): void {
		this.context.transitionTo(new BananaStatus());
	}

	public activateBrainiacStatus(): void {
		this.context.setStatusTimeStamp(Date.now());
	}

	private setToNormalStatusIfCurrentStatusIsOver() {
		if (Date.now() - this.context.getStatusTimeStamp() > this.DEFAULT_MAX_TIME_STATUS) {
			this.context.transitionTo(new NormalStatus());
		}
	}

	public getCurrentStatus(): StatusType {
		return StatusType.BrainiacStatus;
	}
}
