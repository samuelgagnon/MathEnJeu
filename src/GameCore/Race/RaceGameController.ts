import Item from "./items/item";
import Player from "./player/player";
import RaceGrid from "./RaceGrid";

export default abstract class RaceGameController {
	private gameStartTimeStamp: number;
	protected grid: RaceGrid;
	protected players: Player[] = [];
	protected items: Item[];

	constructor(gameStartTimeStamp: number, grid: RaceGrid, players: Player[]) {
		this.gameStartTimeStamp = gameStartTimeStamp;
		this.grid = grid;
		this.players = players;
	}

	protected gameLogicUpdate() {}

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
