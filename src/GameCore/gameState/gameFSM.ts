import State from "./state";
import Player from "../player";
import GameRepository from "../../server/data/gameRepository";
import User from "../../server/data/user";

export default class GameFSM {
	private gameState: State;
	private readonly roomString: string;
	private users: User[];
	private nsp: SocketIO.Namespace;
	private gameRepo: GameRepository;

	constructor(state: State, roomString: string, nsp: SocketIO.Namespace, gameRepo: GameRepository) {
		this.roomString = roomString;
		//starting state
		this.transitionTo(state);
		//this.nsp = nsp;
	}

	public transitionTo(state: State): void {
		this.gameState = state;
		this.gameState.setContext(this);
	}
}
