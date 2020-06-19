import State from "./state";
import GameRepository from "../../server/data/gameRepository";
import User from "../../server/data/user";
import Game from "../game";
export default class GameFSM {
	private gameState: State;
	private readonly roomString: string;
	private users: User[];
	private nsp: SocketIO.Namespace;
	private gameRepo: GameRepository;

	constructor(state: State, gameRepo: GameRepository) {
		//this.roomString = roomString;
		//this.nsp = nsp;
		this.gameRepo = gameRepo;
		//starting state
		this.transitionTo(state);
	}

	public transitionTo(nextState: State): void {
		this.gameState = nextState;
		this.gameState.setContext(this);
	}

	public gameStarted(game: Game): void {
		this.gameRepo.addGame(game);
	}

	public gameFinished(game: Game): void {
		this.gameRepo.deleteGameById(game.getGameId());
	}

	public userJoined(user: User): void {
		this.gameState.userJoined(user);
	}

	public userLeft(user: User): void {
		this.gameState.userLeft(user);
	}
}
