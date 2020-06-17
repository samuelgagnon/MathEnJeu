import Game from "../../GameCore/game";

export default interface GameRepository {
	addGame(game: Game): void;
	getGameById(gameId: string): Game;
	getAllGames(): Game[];
	deleteGameById(gameId: string): void;
}
