import Item, { ItemType } from "./items/item";
import Player from "./player/player";
import RaceGrid from "./raceGrid";

export default abstract class RaceGameController {
	protected readonly gameTime: number;
	protected timeRemaining: number;
	protected readonly gameStartTimeStamp: number;
	protected grid: RaceGrid;
	protected players: Player[] = [];
	protected items: Item[];

	constructor(gameTime: number, gameStartTimeStamp: number, grid: RaceGrid, players: Player[]) {
		this.gameTime = gameTime;
		this.timeRemaining = gameTime;
		this.gameStartTimeStamp = gameStartTimeStamp;
		this.grid = grid;
		this.players = players;
	}

	public update(): void {
		this.gameLogicUpdate();
		this.playersUpdate();
	}

	protected gameLogicUpdate(): void {
		this.timeRemaining = this.gameTime - (Date.now() - this.gameStartTimeStamp);
		//TODO: Do we keep the game finished logic here or send an event to the clients to notify game ended.
		if (this.timeRemaining < 0) this.gameFinished();
	}

	private playersUpdate() {
		this.players.forEach((player) => player.update());
	}

	public addPlayer(player: Player): void {
		this.players.push(player);
	}

	protected abstract gameFinished(): void;

	public removePlayer(socketId: string) {
		this.players = this.players.filter((player) => player.id !== socketId);
	}

	public movePlayerTo(playerId: string, startTimestamp: number, targetLocation: Point): void {
		const movedPlayer = this.findPlayer(playerId);
		movedPlayer.moveTo(startTimestamp, targetLocation);
	}

	protected findPlayer(playerId: string): Player {
		return this.players.find((player) => player.id == playerId);
	}

	protected itemUsed(itemType: ItemType, targetPlayerId: string, fromPlayerId: string): void {
		const target: Player = this.findPlayer(targetPlayerId);
		const from: Player = this.findPlayer(fromPlayerId);

		target.useItemType(itemType, from);
	}
}
