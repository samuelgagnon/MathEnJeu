import Game from "../game";
import Item from "../items/item";
import Player from "../player";
import RaceGameState from "./RaceGameState";

export default abstract class RaceGameController implements Game, RaceGameState {
	private gameId: string;

	private grid: RaceGrid;
	private _players: Player[] = [];
	private _items: Item[];

	constructor(players: Player[] = []) {
		this._players = players;
	}

	get players(): Player[] {
		return this._players;
	}

	get items(): Item[] {
		return this._items;
	}

	public getGameId(): string {
		return this.gameId;
	}

	public update(): void {
		this.gameLogicUpdate();
	}

	protected gameLogicUpdate() {}

	public addPlayer(player: Player): void {
		this._players.push(player);
	}

	public removePlayer(socketId: string) {
		this._players = this._players.filter((player) => player.socketId !== socketId);
	}

	public movePlayerTo(playerId: string, position: Point): void {
		const movedPlayer = this.findPlayer(playerId);
		this._players.filter((player) => player.socketId !== playerId);
		this._players.push(movedPlayer);
	}

	private findPlayer(playerId: string): Player {
		return this._players.find((player) => player.socketId == playerId);
	}
}
