import UsableItem from "./items/usableItem";
import Player from "./playerFSM/player";
import RaceGrid from "./RaceGrid";

export default abstract class RaceGameController {
	private grid: RaceGrid;
	private players: Player[] = [];
	private items: UsableItem[];

	constructor() {}

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

	private findPlayer(playerId: string): Player {
		return this.players.find((player) => player.id == playerId);
	}
}
