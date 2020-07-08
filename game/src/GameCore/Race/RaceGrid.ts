import ItemState from "../../Communication/Race/itemState";
import ItemFactory from "./items/itemFactory";
import Tile from "./tile";

export default class RaceGrid {
	private tiles: Tile[];
	private items: ItemState[];
	private startingPositions: Point[];
	private finishLinePositions: Point[];
	private width: number;
	private height: number;

	constructor(tiles: Tile[], width: number, height: number, items: ItemState[]) {
		this.tiles = tiles;
		this.width = width;
		this.height = height;
		this.items = items;
	}

	public getItemsState(): ItemState[] {
		return this.items;
	}

	public updateFromItemStates(itemStates: ItemState[]): void {
		//Checks the missing elements from the client items list that are in the server items list
		let itemsToAdd: ItemState[] = itemStates.filter((x) => !this.items.includes(x));
		//Checks the missing elements from the server items list that are in the client items list
		let itemsToRemove: ItemState[] = this.items.filter((x) => !itemStates.includes(x));

		itemsToAdd.forEach((item: ItemState) => {
			this.getTile(item.location).setItem(ItemFactory.create(item.type));
		});

		itemsToRemove.forEach((item: ItemState) => {
			this.getTile(item.location).removeItem();
		});
	}

	public getTile(point: Point): Tile {
		return this.tiles[point.x + point.y * this.width];
	}

	public getTiles(): Tile[] {
		return this.tiles;
	}

	public getStartingPositions(): Point[] {
		if (this.startingPositions.length == 0) {
			for (let y = 0; y < this.height; y++) {
				for (let x = 0; x < this.width; x++) {
					if (this.getTile({ x, y }).isStartPosition) this.startingPositions.push({ x, y });
				}
			}
		}

		return this.startingPositions;
	}

	public getFinishLinePosition(): Point[] {
		if (this.finishLinePositions.length == 0) {
			for (let y = 0; y < this.height; y++) {
				for (let x = 0; x < this.width; x++) {
					if (this.getTile({ x, y }).isFnishLine) this.finishLinePositions.push({ x, y });
				}
			}
		}

		return this.finishLinePositions;
	}

	private createItemsStateList(): void {
		this.tiles.forEach((tile: Tile) => {
			const item = tile.getItem();
			if (!item) this.items.push({ type: item.type, location: item.location });
		});
	}
}
