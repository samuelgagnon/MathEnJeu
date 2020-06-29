import Item from "../items/item";
import Move from "../move";
import Status from "./playerStatus/status";

/**
 * Player is a class that implements a finite state machine. The state will changed depending on the action of the Player class and its
 * behavior will also be affected depending of the state it is currently in.
 */

export default class Player {
	readonly id: string;
	private playerStatus: Status;
	private isAnsweringQuestion: boolean = false;
	private statusTimeStamp: number;
	private name: string;
	private points: number;
	private position: Point;
	private move: Move;
	private items: Item[];

	constructor(id: string, startLocation: Point, status: Status) {
		this.id = id;
		this.position = startLocation;
		this.move = new Move(Date.now(), startLocation, startLocation);
		this.transitionTo(status);
	}

	public setStatusTimeStampToNow() {
		this.statusTimeStamp = Date.now();
	}

	public getStatusTimeStamp(): number {
		return this.statusTimeStamp;
	}

	public transitionTo(status: Status) {
		this.playerStatus = status;
		this.playerStatus.setContext(this);
	}

	public getPosition(): Point {
		this.updatePosition();
		return this.position;
	}

	public moveTo(targetLocation: Point): void {
		this.move = new Move(Date.now(), this.getPosition(), targetLocation);
	}

	public updatePosition(): void {
		this.position = this.move.getCurrentPosition();
	}

	public useItemType(itemType: string, target: Player): void {
		const itemUsedIndex = this.items.findIndex((item) => item.type == itemType);

		if (itemUsedIndex == -1) return; //TODO: maybe return false if item is not found ?

		const usedItem = this.items[itemUsedIndex];

		//if he's not anwsering a question and it's only usable during a question.
		if (!this.isAnsweringQuestion && usedItem.isForAnsweringQuestion) throw new Error(itemType); //TODO: create specific error type

		usedItem.use(target, this);
		this.items.splice(itemUsedIndex, 1);
	}

	public useItem(item: Item): void {
		if (item === null) return;

		item.use(this);
	}

	public itemPickedUp(item: Item): void {
		if (item === null) return;

		this.items.push(item);
	}

	public bananaReceivedFrom(from: Player): void {
		this.playerStatus.activateBananaStatus();
	}

	public activateBrainiac(): void {
		this.playerStatus.activateBrainiacStatus();
	}

	public useBook(): void {}

	public useCrystalBall(): void {}
}
