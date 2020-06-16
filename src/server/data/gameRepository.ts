export default interface GameRepository {
	addGame(game): void;
	getGameById(gameId: string);
	getAllGames(): [];
	deleteGameById(gameId: string): void;
}
