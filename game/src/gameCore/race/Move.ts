import MoveState from "../../communication/race/MoveState";
import AffineTransform from "./AffineTransform";
import { RACE_CST } from "./RACE_CST";

export default class Move {
	private startTimestamp: number;
	private startLocation: Point;
	private targetLocation: Point;
	private hasArrived: boolean;
	private readonly SPEED: Point = { x: RACE_CST.MOVE.SPEED, y: RACE_CST.MOVE.SPEED };

	private renderedMove?: Move;
	private positionRendering?: AffineTransform;

	constructor(startTimestamp: number, startLocation: Point, targetLocation: Point, SPEED?: Point, positionRendering?: AffineTransform) {
		this.startTimestamp = startTimestamp;
		this.startLocation = startLocation;
		this.targetLocation = targetLocation;
		this.hasArrived = false;

		if (SPEED !== undefined && SPEED !== null) {
			this.SPEED = SPEED;
		} else {
			this.SPEED = { x: RACE_CST.MOVE.SPEED, y: RACE_CST.MOVE.SPEED };
		}

		if (positionRendering !== undefined && positionRendering !== null) {
			this.setRenderedMove(positionRendering);
		}
	}

	private setRenderedMove(positionRendering) {
		this.positionRendering = positionRendering;
		this.renderedMove = new Move(
			this.startTimestamp,
			positionRendering.apply(this.startLocation),
			positionRendering.apply(this.targetLocation),
			positionRendering.applyLinearTransform({ x: RACE_CST.MOVE.SPEED, y: RACE_CST.MOVE.SPEED })
		);
	}

	private isMoveRendered(): boolean {
		return this.renderedMove !== undefined && this.renderedMove !== null;
	}

	public updateFromMoveState(moveState: MoveState): void {
		this.startTimestamp = moveState.startTimestamp;
		this.startLocation = moveState.startLocation;
		this.targetLocation = moveState.targetLocation;
		if (this.isMoveRendered()) {
			this.renderedMove.updateFromMoveState({
				startTimestamp: moveState.startTimestamp,
				startLocation: this.positionRendering.apply(moveState.startLocation),
				targetLocation: this.positionRendering.apply(moveState.targetLocation),
			});
		}
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

	//Returns taxicab distance (norm 1).
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

	public getCurrentRenderedPosition(positionRendering?: AffineTransform): Point {
		if (this.isMoveRendered) {
			if (positionRendering !== undefined && positionRendering !== null && positionRendering !== this.positionRendering) {
				this.setRenderedMove(positionRendering);
			}
			return this.renderedMove.getCurrentPosition();
		} else {
			return this.getCurrentPosition();
		}
	}
}
