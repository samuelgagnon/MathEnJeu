import { Clock } from "../clock/Clock";
import RaceGrid from "./grid/RaceGrid";
import Tile from "./grid/Tile";
import Item, { ItemType } from "./items/Item";
import Player from "./player/Player";
import { PlayerRepository } from "./player/playerRepository/PlayerRepository";

export default abstract class RaceGameController {
	protected isGameStarted: boolean = false;
	protected readonly gameDuration: number; //in milliseconds
	protected timeRemaining: number;
	protected readonly gameStartTimeStamp: number;
	protected grid: RaceGrid;
	protected playerRepo: PlayerRepository;
	//protected players: Player[] = [];
	protected items: Item[];

	constructor(gameDuration: number, gameStartTimeStamp: number, grid: RaceGrid, playerRepo: PlayerRepository) {
		this.gameDuration = gameDuration;
		this.timeRemaining = gameDuration;
		this.gameStartTimeStamp = gameStartTimeStamp;
		this.grid = grid;
		this.playerRepo = playerRepo;
	}

	public update(): void {
		this.gameLogicUpdate();
		this.playersUpdate();
		this.handleTileCollisions();
		this.handleItemCollisions();
	}

	protected gameLogicUpdate(): void {
		this.timeRemaining = this.gameDuration - (Clock.now() - this.gameStartTimeStamp);
		//This boolean expression is divided in two distinct expressions to avoid computing timestamp difference every loop while the game is already started.
		if (!this.isGameStarted) {
			if (Clock.now() >= this.gameStartTimeStamp) this.isGameStarted = true;
		}
	}

	public getTimeRemaining(): number {
		return this.timeRemaining;
	}

	public getIsGameStarted(): boolean {
		return this.isGameStarted;
	}

	public getGameDuration(): number {
		return this.gameDuration;
	}

	private playersUpdate() {
		this.playerRepo.getAllPlayers().forEach((player) => player.update());
	}

	protected abstract gameFinished(): void;

	// public removePlayer(playerId: string) {
	// 	this.players = this.players.filter((player) => player.id !== playerId);
	// }

	public movePlayerTo(playerId: string, startTimestamp: number, targetLocation: Point): void {
		const movedPlayer = this.playerRepo.findPlayer(playerId);
		movedPlayer.moveTo(startTimestamp, targetLocation);
	}

	// protected findPlayer(playerId: string): Player {
	// 	return this.players.find((player) => player.id == playerId);
	// }

	protected itemUsed(itemType: ItemType, targetPlayerId: string, fromPlayerId: string): void {
		const target: Player = this.playerRepo.findPlayer(targetPlayerId);
		const from: Player = this.playerRepo.findPlayer(fromPlayerId);

		from.useItemType(itemType, target);
	}

	public playerAnsweredQuestion(isAnswerCorrect: boolean, targetLocation: Point, playerId: string, timestamp: number): void {
		this.playerRepo.findPlayer(playerId).answeredQuestion(isAnswerCorrect);
		if (isAnswerCorrect) {
			this.movePlayerTo(playerId, timestamp, targetLocation);
		}
	}

	protected handleItemCollisions(): void {
		this.playerRepo.getAllPlayers().forEach((player) => {
			if (player.hasArrived()) {
				const position = player.getPosition();
				this.grid.getTile({ x: Math.round(position.x), y: Math.round(position.y) }).playerPickUpItem(player);
			}
		});
	}

	private handleTileCollisions(): void {
		this.playerRepo.getAllPlayers().forEach((player) => {
			const playerTile: Tile = this.grid.getTile(player.getPosition());
			if (playerTile.checkpointGroup !== undefined) {
				player.passingByCheckpoint(playerTile.checkpointGroup);
			} else if (playerTile.isFinishLine) {
				player.passingByFinishLine();
			}
		});
	}
}
