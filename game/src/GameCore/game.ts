export interface ServerGame {
	getGameId(): string;
	update(): void;
}

export interface ClientGame {
	update(): void;
}
