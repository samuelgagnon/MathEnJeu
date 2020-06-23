import Game from "../game";
import Item from "./items/item";
import Player from "./player";

export default abstract class RaceGameController implements Game {
	private gameId: string;

	private grid: RaceGrid;
	private players: Player[] = [];
	private items: Item[];

	constructor(players: Player[] = []) {
		this.players = players;
	}

	public getGameId(): string {
		return this.gameId;
	}

	public update(): void {
		this.gameLogicUpdate();
	}

	protected gameLogicUpdate() {}

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
