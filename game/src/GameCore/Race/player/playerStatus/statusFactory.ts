import BananaStatus from "./bananaStatus";
import BrainiacStatus from "./brainiacStatus";
import NormalStatus from "./normalStatus";
import Status from "./status";
import { StatusType } from "./statusType";

export default class StatusFactory {
	public static create(type: StatusType, startTimestamp: number = Date.now()): Status {
		switch (type) {
			case StatusType.BananaStatus:
				return new BananaStatus(startTimestamp);

			case StatusType.BrainiacStatus:
				return new BrainiacStatus(startTimestamp);

			case StatusType.NormalStatus:
				return new NormalStatus();
			default:
				throw Error(); //TODO create meaningful error
		}
	}
}
