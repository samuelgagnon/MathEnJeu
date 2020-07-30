import ItemState from "../../../communication/race/ItemState";
import ItemFactory from "../items/ItemFactory";
import Tile from "./Tile";

export default class RaceGrid {
	private tiles: Tile[];
	private items: ItemState[] = [];
	private startingPositions: Point[] = [];
	private finishLinePositions: Point[] = [];
	private nonWalkablePositions: Point[] = [];
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
		if (!itemStates || JSON.stringify(itemStates) == JSON.stringify(this.items)) return;

		this.items.forEach((itemState: ItemState) => {
			this.getTile(itemState.location).removeItem();
		});

		itemStates.forEach((itemState: ItemState) => {
			this.getTile(itemState.location).setItem(ItemFactory.create(itemState.type, itemState.location));
		});
	}

	public getPossibleMovementFrom(position: Point, moveDistance: number): PossiblePositions[] {
		let upDone = false;
		let downDone = false;
		let leftDone = false;
		let rightDone = false;

		let possiblePositions: PossiblePositions[] = [];

		for (let i = 1; i <= moveDistance; i++) {
			if (position.x - i < 0) leftDone = true;
			if (position.x + i >= this.width) rightDone = true;
			if (position.y - i < 0) upDone = true;
			if (position.y + i >= this.height) downDone = true;

			const currentRightPosition = { x: position.x + i, y: position.y };
			const currentLeftPosition = { x: position.x - i, y: position.y };
			const currentUpPosition = { x: position.x, y: position.y - i };
			const currentDownPosition = { x: position.x, y: position.y + i };

			const currentRightTile = this.getTile(currentRightPosition);
			const currentLeftTile = this.getTile(currentLeftPosition);
			const currentUpTile = this.getTile(currentUpPosition);
			const currentDownTile = this.getTile(currentDownPosition);

			if (!rightDone && currentRightTile.isWalkable) {
				possiblePositions.push({ position: currentRightPosition, distance: i });
			} else {
				rightDone = true;
			}

			if (!leftDone && currentLeftTile.isWalkable) {
				possiblePositions.push({ position: currentLeftPosition, distance: i });
			} else {
				leftDone = true;
			}

			if (!upDone && currentUpTile.isWalkable) {
				possiblePositions.push({ position: currentUpPosition, distance: i });
			} else {
				upDone = true;
			}

			if (!downDone && currentDownTile.isWalkable) {
				possiblePositions.push({ position: currentDownPosition, distance: i });
			} else {
				downDone = true;
			}
		}

		return possiblePositions;
	}

	public getWidth(): number {
		return this.width;
	}

	public getHeight(): number {
		return this.height;
	}

	public getTile(point: Point): Tile {
		return this.tiles[Math.round(point.x) + Math.round(point.y) * this.width];
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

	public getFinishLinePositions(): Point[] {
		if (this.finishLinePositions.length == 0) {
			for (let y = 0; y < this.height; y++) {
				for (let x = 0; x < this.width; x++) {
					if (this.getTile({ x, y }).isFinishLine) this.finishLinePositions.push({ x, y });
				}
			}
		}

		return this.finishLinePositions;
	}

	public getNonWalkablePositions(): Point[] {
		if (this.nonWalkablePositions.length == 0) {
			for (let y = 0; y < this.height; y++) {
				for (let x = 0; x < this.width; x++) {
					if (!this.getTile({ x, y }).isWalkable) this.nonWalkablePositions.push({ x, y });
				}
			}
		}

		return this.nonWalkablePositions;
	}

	private createItemsStateList(): void {
		this.tiles.forEach((tile: Tile) => {
			const item = tile.getItem();
			if (!item) this.items.push({ type: item.type, location: item.location });
		});
	}
}

export interface PossiblePositions {
	position: Point;
	distance: number;
}
