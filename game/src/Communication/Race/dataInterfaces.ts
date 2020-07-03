export interface ItemUsedEvent {
	itemType: string;
	targetPlayerId: string;
	fromPlayerId?: string;
}
