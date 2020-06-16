import GameRepository from "./data/gameRepository";

export default class GameManager {
	private gameRepo: GameRepository;

	constructor(gameRepo: GameRepository) {
		this.gameRepo = gameRepo;
	}

	public startLoop() {
		this.update();
	}

	private update() {
		setTimeout(() => {
			this.gameRepo.getAllGames().forEach((game: any) => {
				game.update();
			});

			this.update();
		}, 1000);
	}
}
