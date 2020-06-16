import Player from "./player";

class GameController {
	grid: Grid;
	players: Player[];

	constructor(grid: Grid, players: Player[]) {
		this.grid = grid;
		this.players = players;
	}

	public addPlayer(player: Player): void {
		this.players.push(player);
	}

	public removePlayer(socketId: string) {
		this.players = this.players.filter((player) => player.socketId !== socketId);
	}

	public movePlayerTo(playerId: string, position: Point): void {
		const movedPlayer = this.findPlayer(playerId);
		this.players.filter((player) => player.socketId !== playerId);
		this.players.push(movedPlayer);
	}

	private findPlayer(playerId: string): Player {
		return this.players.find((player) => player.socketId == playerId);
	}
}
