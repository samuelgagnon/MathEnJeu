import MoveState from "../../communication/race/MoveState";
import { Clock } from "../clock/Clock";
import AffineTransform from "./AffineTransform";
import { RACE_PARAMETERS } from "./RACE_PARAMETERS";

export default class Move {
	private startTimestamp: number;
	private startLocation: Point;
	private targetLocation: Point;
	private hasArrived: boolean;
	private readonly SPEED: Point = { x: RACE_PARAMETERS.MOVE.SPEED, y: RACE_PARAMETERS.MOVE.SPEED };

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
			this.SPEED = { x: RACE_PARAMETERS.MOVE.SPEED, y: RACE_PARAMETERS.MOVE.SPEED };
		}

		if (positionRendering !== undefined && positionRendering !== null) {
			this.setRenderedMove(positionRendering);
		}
	}

	private setRenderedMove(positionRendering: AffineTransform): void {
		this.positionRendering = positionRendering;
		this.renderedMove = new Move(
			this.startTimestamp,
			{ x: positionRendering.b1, y: positionRendering.b2 },
			// positionRendering.apply(this.startLocation),
			{ x: positionRendering.u2, y: positionRendering.v1 },
			// positionRendering.apply(this.targetLocation),
			{ x: positionRendering.u1, y: positionRendering.v2 }
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
				// startLocation: { x: 528, y: 2684 },
				startLocation: this.positionRendering.apply(moveState.startLocation),
				targetLocation: this.positionRendering.apply(moveState.targetLocation),
				// targetLocation: { x: 528, y: 2684 },
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
			Math.sqrt(Math.pow(this.targetLocation.x - this.startLocation.x, 2) + Math.pow(this.targetLocation.y - this.startLocation.y, 2)) / this.SPEED.x
		);
	}

	//Returns taxicab distance (norm 1).
	public getDistance(): number {
		return Move.getTaxiCabDistance(this.startLocation, this.targetLocation);
	}

	public static getTaxiCabDistance(startLocation: Point, targetLocation: Point): number {
		const xDistance = Math.abs(targetLocation.x - startLocation.x);
		const yDistance = Math.abs(targetLocation.y - startLocation.y);
		return xDistance > yDistance ? xDistance : yDistance;
	}

	public static isDiagonal(position: Point, targetLocation: Point): boolean {
		return Math.abs(targetLocation.x - position.x) > 0 || Math.abs(targetLocation.y - position.y) > 0;
	}

	public getCurrentPosition(nowTimestamp: number = Clock.now()): Point {
		let d: number = this.getDistance();

		//t in [0,1] corresponds to the proportion of the move done.
		//t=0 means the move isn't started yet. I.e. the current position corresponds to startLocation.
		//t=1 means the move is over. I.e. the current position corresponds to targetLocation
		let t: number = (nowTimestamp - this.startTimestamp) / this.getTotalTime();
		t = t < 0 ? 0 : t;
		t = t > 1 ? 1 : t;

		this.hasArrived = t === 1;

		//The current position c(t) is a R -> R^2 linear function for t in [0,1]
		let c: Point = {
			x: (1 - t) * this.startLocation.x + t * this.targetLocation.x,
			y: (1 - t) * this.startLocation.y + t * this.targetLocation.y,
		};

		return c;
	}

	public getStartLocation() {
		return this.startLocation;
	}

	public getTargetLocation() {
		return this.targetLocation;
	}

	public getCurrentRenderedPosition(positionRendering?: AffineTransform): Point {
		if (positionRendering && positionRendering !== this.positionRendering) {
			this.setRenderedMove(positionRendering);
		}

		if (this.isMoveRendered()) {
			return this.renderedMove.getCurrentPosition();
		}

		return this.getCurrentPosition();
	}
}
