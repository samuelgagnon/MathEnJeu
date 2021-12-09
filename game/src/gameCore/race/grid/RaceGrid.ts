import ItemState from "../../../communication/race/ItemState";
import ItemFactory from "../items/ItemFactory";
import Player from "../player/Player";
import Tile from "./Tile";

export default class RaceGrid {
	private tiles: Tile[];
	private items: ItemState[] = [];
	private width: number;
	private height: number;
	private numberOfCheckpoints: number;

	constructor(tiles: Tile[], width: number, height: number, items: ItemState[], numberOfCheckpoints: number) {
		this.tiles = tiles;
		this.width = width;
		this.height = height;
		this.items = items;
		this.numberOfCheckpoints = numberOfCheckpoints;
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

		let upWallStep = 0;
		let downWallStep = 0;
		let leftWallStep = 0;
		let rightWallStep = 0;

		let possiblePositions: PossiblePositions[] = [];

		const currentTile = this.getTile(position);
		if (currentTile && currentTile.isStartPosition) {
			upDone = true;
		}

		for (let i = 1; i <= moveDistance; i++) {
			if (position.x - i < 0) leftDone = true;
			if (position.x + i >= this.width) rightDone = true;
			if (position.y - i < 0) upDone = true;
			if (position.y + i >= this.height) downDone = true;

			const currentRightPosition = { x: position.x + i + rightWallStep, y: position.y + rightWallStep };
			const currentLeftPosition = { x: position.x - i - leftWallStep, y: position.y - leftWallStep };
			const currentUpPosition = { x: position.x - upWallStep, y: position.y - i - upWallStep };
			const currentDownPosition = { x: position.x + downWallStep, y: position.y + i + downWallStep };

			const currentRightTile = this.getTile(currentRightPosition);
			const currentLeftTile = this.getTile(currentLeftPosition);
			const currentUpTile = this.getTile(currentUpPosition);
			const currentDownTile = this.getTile(currentDownPosition);

			if (!rightDone && currentRightTile?.isWalkable) {
				possiblePositions.push({ position: currentRightPosition, distance: i });
			} else if (!rightDone && currentRightTile?.isWallTile) {
				rightWallStep += 1;
				const nextPosition = { x: position.x + i + rightWallStep, y: position.y + rightWallStep };
				const nextRightWallTile = this.getTile(nextPosition);
				if (nextRightWallTile?.isWalkable) {
					possiblePositions.push({ position: nextPosition, distance: i });
				} else {
					rightDone = true;
				}
			} else {
				rightDone = true;
			}

			if (!leftDone && currentLeftTile?.isWalkable) {
				possiblePositions.push({ position: currentLeftPosition, distance: i });
			} else if (!leftDone && currentLeftTile?.isWallTile) {
				leftWallStep += 1;
				const nextPosition = { x: position.x - i - leftWallStep, y: position.y - leftWallStep };
				const nextLeftWallTile = this.getTile(nextPosition);
				if (nextLeftWallTile?.isWalkable) {
					possiblePositions.push({ position: nextPosition, distance: i });
				} else {
					leftDone = true;
				}
			} else {
				leftDone = true;
			}

			if (!upDone && currentUpTile?.isWalkable) {
				possiblePositions.push({ position: currentUpPosition, distance: i });
				if (currentUpTile?.isStartPosition) {
					upDone = true;
				}
			} else if (!upDone && currentUpTile?.isWallTile) {
				upWallStep += 1;
				const nextPosition = { x: position.x - upWallStep, y: position.y - i - upWallStep };
				const nextUpWallTile = this.getTile(nextPosition);
				if (nextUpWallTile?.isWalkable) {
					possiblePositions.push({ position: nextPosition, distance: i });
				} else {
					upDone = true;
				}
			} else {
				upDone = true;
			}

			if (!downDone && currentDownTile?.isWalkable) {
				possiblePositions.push({ position: currentDownPosition, distance: i });
			} else if (!downDone && currentDownTile?.isWallTile) {
				downWallStep += 1;
				const nextPosition = { x: position.x + downWallStep, y: position.y + i + downWallStep };
				const nextDownWallTile = this.getTile(nextPosition);
				if (nextDownWallTile?.isWalkable) {
					possiblePositions.push({ position: nextPosition, distance: i });
				} else {
					downDone = true;
				}
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

	/**
	 * @returns an array that contains multiple arrays of checkpoints positionned based on the checkpoint group.
	 *
	 * For exemple, if you have 4 checkpoint positions and have 2 of each group, you would have: [[cp1, cp2], [c3, cp4]]. cp1 and cp2 are from
	 * checkpoint group 1 and c3 and cp4 are from checkpoint group 2.
	 */
	public getCheckpointPositions(): Point[][] {
		let checkpointPositions: Point[][] = [];
		for (let i = 1; i <= this.numberOfCheckpoints; i++) {
			checkpointPositions.push(
				this.getTiles()
					.filter((tile: Tile) => {
						return tile.checkpointGroup === i;
					})
					.map((tile: Tile) => {
						return tile.getPosition();
					})
			);
		}
		return checkpointPositions;
	}

	public getStartingPositions(): Point[] {
		return this.getTiles()
			.filter((tile: Tile) => {
				return tile.isStartPosition;
			})
			.map((tile: Tile) => {
				return tile.getPosition();
			});
	}

	public getFinishLinePositions(): Point[] {
		return this.getTiles()
			.filter((tile: Tile) => {
				return tile.isFinishLine;
			})
			.map((tile) => {
				return tile.getPosition();
			});
	}

	public getNonWalkablePositions(): Point[] {
		return this.getTiles()
			.filter((tile: Tile) => {
				return !tile.isWalkable;
			})
			.map((tile: Tile) => {
				return tile.getPosition();
			});
	}

	private updateItemsStateList(removedItemPosition: Point): void {
		this.items.forEach((item: ItemState, index: number) => {
			const itemPosition = item.location;
			if (itemPosition.x === removedItemPosition.x && itemPosition.y === removedItemPosition.y) {
				this.items.splice(index, 1);
			}
		});
	}

	public handleItemCollision(player: Player): boolean {
		let itemPickedUp: boolean = false;
		if (player.hasArrived()) {
			const position = player.getPosition();
			itemPickedUp = this.getTile({ x: Math.round(position.x), y: Math.round(position.y) }).playerPickUpItem(player);

			if (itemPickedUp) {
				this.updateItemsStateList(position);
			}
		}
		return itemPickedUp;
	}

	public generateNewItem(playerPositions: Point[], isSinglePlayer: boolean) {
		const availableTiles = this.getTiles().filter((tile: Tile) => {
			return tile.isAvailableForANewItem() && !playerPositions.some((p) => p.x === tile.getPosition().x && p.y === tile.getPosition().y);
		});
		const rng = Math.floor(Math.random() * availableTiles.length);
		const itemTile = availableTiles[rng];
		const itemType = ItemFactory.generateItemType(isSinglePlayer);
		const newItem = ItemFactory.create(itemType, itemTile.getPosition());
		itemTile.setItem(newItem);
		this.items.push(newItem);
	}
}

export interface PossiblePositions {
	position: Point;
	distance: number;
}
