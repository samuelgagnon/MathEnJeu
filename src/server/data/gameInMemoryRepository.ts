import GameRepository from "./gameRepository";
import Game from "../../GameCore/game";

export default class GameInMemoryRepository implements GameRepository {
	private games: Map<string, Game> = new Map<string, Game>();

	constructor() {}

	public addGame(game: Game): void {
		this.games.set(game.getGameId(), game);
	}
	public getGameById(gameId: string): Game {
		return this.games.get(gameId);
	}

	public getAllGames(): Game[] {
		return Array.from(this.games.values());
	}

	public deleteGameById(gameId: string): void {
		this.games.delete(gameId);
	}
}
