import BrainiacStatus from "./brainiacStatus";
import NormalStatus from "./normalStatus";
import Status from "./status";

export default class BananaStatus extends Status {
	private readonly DEFAULT_MAX_TIME_STATUS: Number = 90000; //milliseconds

	constructor() {
		super();
		this.context.setStatusTimeStampToNow();
	}

	public update(): void {
		this.setToNormalStatusIfCurrentStatusIsOver();
	}

	public activateBananaStatus(): void {
		this.context.setStatusTimeStampToNow();
	}

	public activateBrainiacStatus(): void {
		this.context.transitionTo(new BrainiacStatus());
	}

	private setToNormalStatusIfCurrentStatusIsOver() {
		if (Date.now() - this.context.getStatusTimeStamp() > this.DEFAULT_MAX_TIME_STATUS) {
			this.context.transitionTo(new NormalStatus());
		}
	}
}
