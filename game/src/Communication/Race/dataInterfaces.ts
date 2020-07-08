import { ItemType } from "../../GameCore/Race/items/item";
import Player from "../../GameCore/Race/player/player";
import RaceGrid from "../../GameCore/Race/RaceGrid";

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
	grid: RaceGrid;
	players: Player[];
}
