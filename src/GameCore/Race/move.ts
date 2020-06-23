import { GAMECORE_CST } from "../GAMECORE_CST";
import { RACE_CST } from "./RACE_CST";

export default class Move {
	startTimestamp: number;
	startLocation: Point;
	targetLocation: Point;
	private readonly NORM: GAMECORE_CST.Norm = RACE_CST.MOVE.NORM;
	private readonly SPEED: number = RACE_CST.MOVE.SPEED;

	constructor(startTimestamp: number, startLocation: Point, targetLocation: Point) {
		this.startTimestamp = startTimestamp;
		this.startLocation = startLocation;
		this.targetLocation = targetLocation;
	}

	private getTotalTime(): number {
		return this.getDistance() / this.SPEED;
	}

	private getDistance(): number {
		switch (this.NORM) {
			case GAMECORE_CST.Norm.Taxicab:
				return Math.abs(this.targetLocation.x - this.startLocation.x + (this.targetLocation.y - this.startLocation.y));
				break;
			case GAMECORE_CST.Norm.Euclidian:
				return Math.sqrt((this.targetLocation.x - this.startLocation.x) ** 2 + (this.targetLocation.y - this.startLocation.y) ** 2);
				break;
		}
	}

	public getCurrentPosition(nowTimestamp: number = Date.now()): Point {
		let d: number = this.getDistance();

		//t in [0,1] corresponds to the proportion of the move done.
		//t=0 means the move isn't started yet. I.e. the current position corresponds to startLocation.
		//t=1 means the move is over. I.e. the current position corresponds to targetLocation
		let t: number = (Date.now() - this.startTimestamp) / this.getTotalTime();
		t = t < 0 ? 0 : t;
		t = t > 1 ? 1 : t;

		//The current position c(t) is a R -> R^2 linear function for t in [0,1]
		let c: Point = {
			x: (1 - t) * this.startLocation.x + t * this.targetLocation.x,
			y: (1 - t) * this.startLocation.y + t * this.targetLocation.y,
		};

		return c;
	}
}
