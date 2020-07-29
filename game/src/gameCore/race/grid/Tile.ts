import Item from "../items/Item";
import Player from "../player/Player";

export default class Tile {
	private item: Item;
	readonly isWalkable: boolean;
	readonly isStartPosition: boolean;
	readonly isFinishLine: boolean;
	readonly checkPointGroup?: number;

	constructor(isWalkable: boolean, startPosition: boolean, isFinishLine: boolean, item?: Item, checkPointGroup?: number) {
		this.isWalkable = isWalkable;
		this.isStartPosition = startPosition;
		this.isFinishLine = isFinishLine;
		this.item = item;
		this.checkPointGroup = checkPointGroup;
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
