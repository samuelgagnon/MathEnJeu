import { ItemType } from "../../GameCore/Race/items/item";
import Inventory from "../../GameCore/Race/player/inventory";
import { StatusType } from "../../GameCore/Race/player/playerStatus/statusType";
import ItemState from "./itemState";
import PlayerState from "./playerState";

export interface ItemUsedEvent {
	itemType: ItemType;
	targetPlayerId: string;
	fromPlayerId?: string;
}

export interface MoveRequestEvent {
	playerId: string;
	targetLocation: Point;
}

export interface GameStartEvent {
	gameTime: number;
	gameStartTimeStamp: number;
	grid: StartingRaceGridInfo;
	players: PlayerState[];
}

export interface StartingRaceGridInfo {
	width: number;
	height: number;
	startingPositions: Point[];
	finishLinePositions: Point[];
	itemStates: ItemState[];
}

export interface PlayerInfo {
	id: string;
	startLocation: Point;
	name: string;
	status: StatusType;
	inventory: Inventory;
}
