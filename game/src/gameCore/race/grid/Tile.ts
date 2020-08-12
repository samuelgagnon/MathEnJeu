import Item from "../items/Item";
import Player from "../player/Player";

export default class Tile {
	private item: Item;
	public readonly isWalkable: boolean;
	public readonly isStartPosition: boolean;
	public readonly isFinishLine: boolean;
	readonly checkpointGroup?: number;
	readonly position: Point;

	constructor(position: Point, isWalkable: boolean, startPosition: boolean, isFinishLine: boolean, item?: Item, checkpointGroup?: number) {
		this.position = position;
		this.isWalkable = isWalkable;
		this.isStartPosition = startPosition;
		this.isFinishLine = isFinishLine;
		this.item = item;
		this.checkpointGroup = checkpointGroup;
	}

	public getPosition(): Point {
		return this.position;
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

	public playerPickUpItem(player: Player): boolean {
		if (this.item) {
			this.item.onPickUp(player);
			this.item = undefined;
			return true;
		} else {
			return false;
		}
	}

	public isAvailableForANewItem(): boolean {
		return this.isWalkable && !this.isStartPosition && !this.isFinishLine && this.getItem() == undefined;
	}
}
