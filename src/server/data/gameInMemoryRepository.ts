import GameRepository from "./gameRepository";

export default class GameInMemoryRepository implements GameRepository {
	constructor() {}

	public addGame(game: any): void {
		throw new Error("Method not implemented.");
	}
	public getGameById(gameId: string) {
		throw new Error("Method not implemented.");
	}

	public getAllGames(): [] {
		throw new Error("Method not implemented.");
	}

	public deleteGameById(gameId: string): void {
		throw new Error("Method not implemented.");
	}
}
