import MoveState from "../../communication/race/MoveState";
import { RACE_CST } from "./RACE_CST";

export default class Move {
	private startTimestamp: number;
	private startLocation: Point;
	private targetLocation: Point;
	private hasArrived: boolean;
	private SPEED: Point = { x: RACE_CST.MOVE.SPEED, y: RACE_CST.MOVE.SPEED };

	constructor(startTimestamp: number, startLocation: Point, targetLocation: Point, affineTransform?: AffineTransform) {
		if (affineTransform === undefined || affineTransform === null) {
			//if no affineTransform has been defined, we initialize it as the identity function.
			//i.e., affineTransform.apply(x) returns x for any point x.
			let affineTransform = new AffineTransform(1, 0, 1, 0, 0, 0);
		}
		this.startTimestamp = startTimestamp;
		this.startLocation = affineTransform.apply(startLocation);
		this.targetLocation = affineTransform.apply(targetLocation);
		this.SPEED = affineTransform.apply({ x: RACE_CST.MOVE.SPEED, y: RACE_CST.MOVE.SPEED });
		this.hasArrived = false;
	}

	public updateFromMoveState(moveState: MoveState): void {
		this.startTimestamp = moveState.startTimestamp;
		this.startLocation = moveState.startLocation;
		this.targetLocation = moveState.targetLocation;
	}

	public getMoveState(): MoveState {
		return { startTimestamp: this.startTimestamp, startLocation: this.startLocation, targetLocation: this.targetLocation };
	}

	public getHasArrived(): boolean {
		return this.hasArrived;
	}

	private getTotalTime(): number {
		return (
			Math.abs(this.targetLocation.x - this.startLocation.x) / this.SPEED.x + Math.abs(this.targetLocation.y - this.startLocation.y) / this.SPEED.y
		);
	}

	private getDistance(): number {
		return Math.abs(this.targetLocation.x - this.startLocation.x) + Math.abs(this.targetLocation.y - this.startLocation.y);
	}

	public getCurrentPosition(nowTimestamp: number = Date.now()): Point {
		let d: number = this.getDistance();

		//t in [0,1] corresponds to the proportion of the move done.
		//t=0 means the move isn't started yet. I.e. the current position corresponds to startLocation.
		//t=1 means the move is over. I.e. the current position corresponds to targetLocation
		let t: number = (nowTimestamp - this.startTimestamp) / this.getTotalTime();
		t = t < 0 ? 0 : t;
		t = t > 1 ? 1 : t;

		if (t === 1) this.hasArrived = true;

		//The current position c(t) is a R -> R^2 linear function for t in [0,1]
		let c: Point = {
			x: (1 - t) * this.startLocation.x + t * this.targetLocation.x,
			y: (1 - t) * this.startLocation.y + t * this.targetLocation.y,
		};

		return c;
	}
}
