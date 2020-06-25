import Item from "./items/item";
import Move from "./move";

export default class Player {
	readonly socketId: string;
	name: string;
	points: number;
	position: Point;
	move: Move;
	items: Item[];
	brainiacState: boolean;
	bananaState: boolean;
	stateStartTimeStamp: number;

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

	public useItem(item: Item): void {
		item.use(this);
	}

	public brainiacActivated(): void {
		this.stateStartTimeStamp = Date.now();
		this.bananaState = false;
		this.brainiacState = true;
	}

	public bananaTrown(targetPlayer: Player): void {
		targetPlayer.bananaReceive();
	}

	public bananaReceive(): void {
		this.stateStartTimeStamp = Date.now();
		this.brainiacState = false;
		this.bananaState = true;
	}

	public itemPickedUp(item: Item): void {
		if (item === null) return;

		this.items.push(item);
	}
}
