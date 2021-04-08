import ItemState from "./ItemState";

export interface StartingRaceGridInfo {
	width: number;
	height: number;
	nonWalkablePositions: Point[];
	startingPositions: Point[];
	finishLinePositions: Point[];
	itemStates: ItemState[];
}
