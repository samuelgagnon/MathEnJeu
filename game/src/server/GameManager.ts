import { ServerGame } from "../gameCore/Game";
import GameRepository from "./data/GameRepository";

/**
 * This class is used to loop through every game in the repo and executing
 */
export default class GameManager {
	private gameRepo: GameRepository;
	private FREQUENCY: number = 45;

	constructor(gameRepo: GameRepository) {
		this.gameRepo = gameRepo;
	}

	public startLoop() {
		this.update();
	}

	private update() {
		setInterval(() => {
			this.gameRepo.getAllGames().forEach((game: ServerGame) => {
				game.update();
			});
		}, this.FREQUENCY);
	}
}
