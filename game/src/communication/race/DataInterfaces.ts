import { ItemType } from "../../gameCore/race/items/Item";
import Inventory from "../../gameCore/race/player/Inventory";
import { StatusType } from "../../gameCore/race/player/playerStatus/StatusType";
import ItemState from "./ItemState";
import PlayerState from "./PlayerState";

export interface ItemUsedEvent {
	itemType: ItemType;
	targetPlayerId: string;
	fromPlayerId?: string;
}

export interface MoveRequestEvent {
	playerId: string;
	startTimestamp: number;
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
