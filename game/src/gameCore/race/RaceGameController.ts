import RaceGrid from "./grid/RaceGrid";
import Tile from "./grid/Tile";
import Item, { ItemType } from "./items/Item";
import Player from "./player/Player";

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
		this.handleTileCollisions();
		this.handleItemCollisions();
	}

	protected gameLogicUpdate(): void {
		this.timeRemaining = this.gameTime - (Date.now() - this.gameStartTimeStamp);
	}

	public getTimeRemaining(): number {
		return this.timeRemaining;
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

		from.useItemType(itemType, target);
	}

	private handleItemCollisions(): void {
		this.players.forEach((player) => {
			const targetLocation = player.getMove().getMoveState().targetLocation;
			const startLocation = player.getMove().getMoveState().startLocation;
			const position = player.getPosition();
			if (targetLocation.x > startLocation.x || targetLocation.y > startLocation.y) {
				this.grid.getTile({ x: Math.floor(position.x), y: Math.floor(position.y) }).playerPickUpItem(player);
			} else {
				this.grid.getTile({ x: Math.ceil(position.x), y: Math.ceil(position.y) }).playerPickUpItem(player);
			}
			// this.grid.getTile({ x: Math.round(position.x), y: Math.round(position.y) }).playerPickUpItem(player);
		});
	}

	private handleTileCollisions(): void {
		this.players.forEach((player) => {
			let playerTile: Tile = this.grid.getTile(player.getPosition());
			if (playerTile.checkpointGroup !== undefined) {
				player.passingByCheckpoint(playerTile.checkpointGroup);
			} else if (playerTile.isFinishLine) {
				player.passingByFinishLine();
			}
		});
	}
}
