import Item from "./items/item";
import Player from "./player/player";

export default class Tile {
	private item: Item;
	readonly isWalkable: boolean;
	readonly isStartPosition: boolean;
	readonly isFnishLine: boolean;

	constructor(isWalkable: boolean, startPosition: boolean, isFinishLine: boolean, item?: Item) {
		this.isWalkable = isWalkable;
		this.isStartPosition = startPosition;
		this.isFnishLine = isFinishLine;
		this.item = item;
	}

	public getItem(): Item {
		return this.item;
	}

	public setItem(item: Item): void {
		this.item = item;
	}

	public removeItem(): void {
		this.item = undefined;
	}

	public playerPickUpItem(player: Player): void {
		if (this.item) {
			this.item.onPickUp(player);
			this.item = undefined;
		}
	}
}
