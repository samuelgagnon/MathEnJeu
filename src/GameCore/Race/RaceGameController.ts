import Item from "./items/item";
import Player from "./player/player";
import RaceGrid from "./RaceGrid";

export default abstract class RaceGameController {
	private readonly gameTime: number;
	protected timeRemaining: number;
	private readonly gameStartTimeStamp: number;
	protected grid: RaceGrid;
	protected players: Player[] = [];
	protected items: Item[];

	constructor(maxGameTime: number, gameStartTimeStamp: number, grid: RaceGrid, players: Player[]) {
		this.gameTime, (this.timeRemaining = maxGameTime);
		this.gameStartTimeStamp = gameStartTimeStamp;
		this.grid = grid;
		this.players = players;
	}

	protected gameLogicUpdate(): void {
		this.timeRemaining = this.gameTime - (Date.now() - this.gameStartTimeStamp);
	}

	public addPlayer(player: Player): void {
		this.players.push(player);
	}

	public removePlayer(socketId: string) {
		this.players = this.players.filter((player) => player.id !== socketId);
	}

	public movePlayerTo(playerId: string, targetLocation: Point): void {
		const movedPlayer = this.findPlayer(playerId);
		movedPlayer.moveTo(targetLocation);
	}

	protected findPlayer(playerId: string): Player {
		return this.players.find((player) => player.id == playerId);
	}

	protected itemUsed(itemType: string, targetPlayerId: string, fromPlayerId: string): void {
		const target: Player = this.findPlayer(targetPlayerId);
		const from: Player = this.findPlayer(fromPlayerId);

		target.useItemType(itemType, from);
	}
}
