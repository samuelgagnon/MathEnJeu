import Item from "./items/item";
import Move from "./move";

export default class Player {
	readonly socketId: string;
	name: string;
	points: number;
	position: Point;
	move: Move;
	items: Item[];

	constructor(socketId: string) {
		this.socketId = socketId;
	}

	public movePlayerTo(position: Point): void {
		this.position = position;
	}
}
