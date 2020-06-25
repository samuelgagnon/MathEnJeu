import { ServerGame } from "../../GameCore/game";

export default interface GameRepository {
	addGame(game: ServerGame): void;
	getGameById(gameId: string): ServerGame;
	getAllGames(): ServerGame[];
	deleteGameById(gameId: string): void;
}
