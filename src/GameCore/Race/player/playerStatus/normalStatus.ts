import BananaStatus from "./bananaStatus";
import BrainiacStatus from "./brainiacStatus";
import Status from "./status";

export default class NormalStatus extends Status {
	constructor() {
		super();
	}

	public update(): void {}

	public activateBananaStatus(): void {
		this.context.transitionTo(new BananaStatus());
	}

	public activateBrainiacStatus(): void {
		this.context.transitionTo(new BrainiacStatus());
	}
}
