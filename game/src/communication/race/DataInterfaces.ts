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

export interface GameEndEvent {
	playerEndStates: PlayerEndState[];
}

export interface PlayerLeftEvent {
	playerId: string;
}

export interface PlayerEndState {
	playerId: string;
	points: number;
	name: string;
	//TODO: Maybe put the user information here
	//to know what character model is used and possibly the grade the player is
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