import { Clock } from "../clock/Clock";
import RaceGrid from "./grid/RaceGrid";
import Tile from "./grid/Tile";
import Item, { ItemType } from "./items/Item";
import Player from "./player/Player";

export default abstract class RaceGameController {
	protected readonly gameTime: number; //in milliseconds
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
		this.timeRemaining = this.gameTime - (Clock.now() - this.gameStartTimeStamp);
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

	public getPointsForMoveDistance(moveDistance: number): number {
		let points = 0;
		switch (moveDistance) {
			case 1:
				points = 2;
				break;
			case 2:
				points = 3;
				break;
			case 3:
				points = 5;
				break;
			case 4:
				points = 8;
				break;
			case 5:
				points = 13;
				break;
			case 6:
				points = 21;
				break;
			case 7:
				points = 34;
				break;
		}
		return points;
	}

	public movePlayerTo(playerId: string, startTimestamp: number, targetLocation: Point): void {
		const movedPlayer = this.findPlayer(playerId);
		movedPlayer.moveTo(startTimestamp, targetLocation, this.getPointsForMoveDistance);
	}

	protected findPlayer(playerId: string): Player {
		return this.players.find((player) => player.id == playerId);
	}

	protected itemUsed(itemType: ItemType, targetPlayerId: string, fromPlayerId: string): void {
		const target: Player = this.findPlayer(targetPlayerId);
		const from: Player = this.findPlayer(fromPlayerId);

		from.useItemType(itemType, target);
	}

	protected playerAnsweredQuestion(isAnswerCorrect: boolean, targetLocation: Point, playerId: string, timestamp: number): void {
		const player = this.findPlayer(playerId);
		player.answeredQuestion(isAnswerCorrect);
		if (isAnswerCorrect) {
			this.movePlayerTo(playerId, timestamp, targetLocation);
		} else {
			player.givePenalty();
		}
	}

	protected handleItemCollisions(): void {
		this.players.forEach((player) => {
			if (player.hasArrived()) {
				const position = player.getPosition();
				this.grid.getTile({ x: Math.round(position.x), y: Math.round(position.y) }).playerPickUpItem(player);
			}
		});
	}

	private handleTileCollisions(): void {
		this.players.forEach((player) => {
			const playerTile: Tile = this.grid.getTile(player.getPosition());
			if (playerTile.checkpointGroup !== undefined) {
				player.passingByCheckpoint(playerTile.checkpointGroup);
			} else if (playerTile.isFinishLine) {
				player.passingByFinishLine();
			}
		});
	}
}
