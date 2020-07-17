import BananaStatus from "./BananaStatus";
import BrainiacStatus from "./BrainiacStatus";
import NormalStatus from "./NormalStatus";
import Status from "./Status";
import { StatusType } from "./StatusType";

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
