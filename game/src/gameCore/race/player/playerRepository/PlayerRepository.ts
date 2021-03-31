import Player from "../Player";

export interface PlayerRepository {
	findPlayer(playerId: string): Player;
	getAllPlayers(): Player[];
	addPlayer(player: Player): void;
	removePlayer(playerId: string): void;
}

export interface TargetablePlayers {
	getAllPlayers(): Player[];
}
