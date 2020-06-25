import Status from "./playerStatus";

export default class BrainiacStatus extends Status {
	constructor() {
		super();
	}

	public bananaReceived(): void {
		throw new Error("Method not implemented.");
	}
	public brainiacActivated(): void {
		throw new Error("Method not implemented.");
	}
}
