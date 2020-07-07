import { StatusState } from "../../../../Communication/Race/playerState";
import Status from "./status";
import StatusFactory from "./statusFactory";
import { StatusType } from "./statusType";

export default class NormalStatus extends Status {
	constructor() {
		super();
	}

	public update(): void {}

	public updateFromState(statusState: StatusState): void {
		switch (statusState.statusType) {
			case StatusType.NormalStatus:
				break;
			case StatusType.BananaStatus:
				this.context.transitionTo(StatusFactory.create(StatusType.BananaStatus, statusState.statusTimestamp));
				break;
			case StatusType.BrainiacStatus:
				this.context.transitionTo(StatusFactory.create(StatusType.BrainiacStatus, statusState.statusTimestamp));
				break;
		}
	}

	public activateBananaStatus(): void {
		this.context.transitionTo(StatusFactory.create(StatusType.BananaStatus));
	}

	public activateBrainiacStatus(): void {
		this.context.transitionTo(StatusFactory.create(StatusType.BrainiacStatus));
	}

	public getCurrentStatus(): StatusType {
		return StatusType.NormalStatus;
	}
}
