import Player from "../Player";

export default interface PlayerRepository {
	findPlayer(playerId: string): Player;
	getAllPlayers(): Player[];
	addPlayer(player: Player): void;
	removePlayer(playerId: string): void;
}
