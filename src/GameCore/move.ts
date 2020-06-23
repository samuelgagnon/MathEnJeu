import MoveState from "./moveState";

export default class Move implements MoveState {
	startTimestamp: number;
	startLocation: Point;
	targetLocation: Point;
	speed: number;

	constructor(startTimestamp: number, startLocation: Point, targetLocation: Point) {
		this.startTimestamp = startTimestamp;
		this.startLocation = startLocation;
		this.targetLocation = targetLocation;
	}
}
