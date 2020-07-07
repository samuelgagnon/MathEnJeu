import Item from "./items/item";
import Player from "./player/player";

export default class Tile {
	private item?: Item;
	readonly isWakable: boolean;
	readonly isStartPosition: boolean;
	readonly isFnishLine: boolean;

	constructor(isWakable: boolean, startPosition: boolean, isFinishLine: boolean, item?: Item) {
		this.item = item;
		this.isWakable = isWakable;
		this.isStartPosition = startPosition;
		this.isFnishLine = isFinishLine;
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
		if (this.item) player.pickUpItem(this.item);
	}
}
