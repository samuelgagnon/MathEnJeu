import { ServerGame } from "../../gameCore/Game";
import GameRepository from "./GameRepository";

export default class GameInMemoryRepository implements GameRepository {
	private games: Map<string, ServerGame> = new Map<string, ServerGame>();

	public addGame(game: ServerGame): void {
		this.games.set(game.getGameId(), game);
	}

	public getGameById(gameId: string): ServerGame {
		return this.games.get(gameId);
	}

	public getAllGames(): ServerGame[] {
		return Array.from(this.games.values());
	}

	public deleteGameById(gameId: string): void {
		this.games.delete(gameId);
	}
}
