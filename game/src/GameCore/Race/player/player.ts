import PlayerState from "../../../Communication/Race/playerState";
import Item, { ItemType } from "../items/item";
import Move from "../move";
import Inventory from "./inventory";
import { startingInventory } from "./inventoryObject";
import Status from "./playerStatus/status";

/**
 * Player is a class that implements a finite state machine. The state will changed depending on the action of the Player class and its
 * behavior will also be affected depending of the state it is currently in.
 */

export default class Player {
	readonly id: string;
	private missedQuestionsCount: number = 0;
	private playerStatus: Status;
	private isAnsweringQuestion: boolean = false;
	private name: string;
	private points: number = 0;
	private position: Point;
	private move: Move;
	private inventory: Inventory;

	constructor(id: string, startLocation: Point, name: string, status: Status) {
		this.id = id;
		this.position = startLocation;
		this.move = new Move(Date.now(), startLocation, startLocation);
		this.name = name;
		this.inventory = startingInventory;
		this.transitionTo(status);
	}

	public update(): void {
		this.updatePosition();
		this.playerStatus.update();
	}

	public updateFromPlayerState(playerState: PlayerState): void {
		this.points = playerState.points;
		this.isAnsweringQuestion = playerState.isAnsweringQuestion;
		this.missedQuestionsCount = playerState.missedQuestionsCount;
		this.inventory.updateInventoryFromState(playerState.inventoryState);
		this.playerStatus.updateFromState(playerState.statusState);
		this.move.updateFromMoveState(playerState.move);
	}

	public getPlayerState(): PlayerState {
		return <PlayerState>{
			id: this.id,
			points: this.points,
			statusState: { statusType: this.playerStatus.getCurrentStatus(), statusTimestamp: this.playerStatus.getStartTimeStatus() },
			move: this.move.getMoveState(),
			inventoryState: this.inventory.getInventoryState(),
		};
	}

	public getInventory(): Inventory {
		return this.inventory;
	}

	public getIsAnsweringQuestion(): boolean {
		return this.isAnsweringQuestion;
	}

	public transitionTo(status: Status) {
		this.playerStatus = status;
		this.playerStatus.setContext(this);
	}

	public getPosition(): Point {
		return this.position;
	}

	public moveTo(targetLocation: Point): void {
		this.move = new Move(Date.now(), this.getPosition(), targetLocation);
	}

	public updatePosition(): void {
		this.position = this.move.getCurrentPosition();
	}

	public useItemType(itemType: ItemType, target: Player): void {
		// const itemUsedIndex = this.items.findIndex((item) => item.type == itemType);
		// if (itemUsedIndex == -1) return; //TODO: maybe return false if item is not found ?
		// const usedItem = this.items[itemUsedIndex];

		const usedItem = this.inventory.getItem(itemType);
		if (!usedItem) return; //Manage error maybe

		//if he's not anwsering a question and it's only usable during a question.
		if (!this.isAnsweringQuestion && usedItem.isForAnsweringQuestion) throw new Error(itemType); //TODO: create specific error type

		usedItem.use(target, this);
		this.inventory.removeItem(itemType);
		//this.items.splice(itemUsedIndex, 1);
		//this.removeItemFromInventory(usedItem);
	}

	public useItem(item: Item): void {
		if (item === null) return;

		item.use(this);
	}

	public pickUpItem(item: Item): void {
		if (item === null) return;

		this.inventory.addItem(item);
		//this.items.push(item);
		//this.addItemToInventory(item);
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
