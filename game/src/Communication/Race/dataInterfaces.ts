export interface ItemUsedEvent {
	itemType: string;
	targetPlayerId: string;
	fromPlayerId?: string;
}

export interface MoveRequestEvent {
	playerId: string;
	targetLocation: Point;
}
