import Player from "./player";
import Game from "./game";

class GameController implements Game {
	private gameId: string;
	private grid: Grid;
	private players: Player[];

	constructor(grid: Grid, players: Player[]) {
		this.grid = grid;
		this.players = players;
	}

	public getGameId(): string {
		return this.gameId;
	}

	public update(): void {}

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
