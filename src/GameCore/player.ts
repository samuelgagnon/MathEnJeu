import Item from "./items/item";
import Move from "./move";
import PlayerState from "./playerState";

export default class Player implements PlayerState {
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
