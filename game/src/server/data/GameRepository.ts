import { ServerGame } from "../../gameCore/Game";

/**
 * This repository will always be used to update the game loop for each game. See GameManage class for more details about its use.
 */
export default interface GameRepository {
	addGame(game: ServerGame): void;
	getGameById(gameId: string): ServerGame;
	getAllGames(): ServerGame[];
	deleteGameById(gameId: string): void;
}
