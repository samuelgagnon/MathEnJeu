import Item from "./items/item";
import Player from "./player";
import RaceGrid from "./RaceGrid";

export default abstract class RaceGameController {
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

	protected gameLogicUpdate() {}

	public addPlayer(player: Player): void {
		this.players.push(player);
	}

	public removePlayer(socketId: string) {
		this.players = this.players.filter((player) => player.socketId !== socketId);
	}

	public movePlayerTo(playerId: string, targetLocation: Point): void {
		const movedPlayer = this.findPlayer(playerId);
		movedPlayer.moveTo(targetLocation);
	}

	private findPlayer(playerId: string): Player {
		return this.players.find((player) => player.socketId == playerId);
	}
}
