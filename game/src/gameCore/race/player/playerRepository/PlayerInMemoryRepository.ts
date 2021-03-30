import Player from "../Player";
import PlayerRepository from "./PlayerRepository";

export default class PlayerInMemoryRepository implements PlayerRepository {
	private players: Player[] = [];

	public findPlayer(playerId: string): Player {
		return this.players.find((player) => player.id == playerId);
	}

	public getAllPlayers(): Player[] {
		return this.players;
	}

	public addPlayer(player: Player): void {
		this.players.push(player);
	}

	public removePlayer(playerId: string): void {
		this.players = this.players.filter((player) => player.id !== playerId);
	}
}
