import Item from "./items/item";
import Move from "./move";

export default class Player {
	readonly socketId: string;
	name: string;
	points: number;
	position: Point;
	move: Move;
	items: Item[];

	constructor(socketId: string, startLocation: Point) {
		this.socketId = socketId;
		this.position = startLocation;
		this.move = new Move(Date.now(), startLocation, startLocation);
	}

	public moveTo(targetLocation: Point): void {
		this.move = new Move(Date.now(), this.getPosition(), targetLocation);
	}

	public updatePosition(): void {
		this.position = this.move.getCurrentPosition();
	}

	public getPosition(): Point {
		this.updatePosition();
		return this.position;
	}
}
