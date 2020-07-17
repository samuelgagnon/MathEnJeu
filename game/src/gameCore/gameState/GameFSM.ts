import { Namespace } from "socket.io";
import GameRepository from "../../server/data/GameRepository";
import User from "../../server/data/User";
import { ServerGame } from "../Game";
import State from "./State";
export default class GameFSM {
	private readonly fsmId: string;
	private state: State;
	private readonly roomString: string;
	private users: User[] = [];
	private nsp: SocketIO.Namespace;
	private gameRepo: GameRepository;

	constructor(id: string, state: State, gameRepo: GameRepository, roomString: string, nsp: Namespace) {
		this.fsmId = id;
		this.roomString = roomString;
		this.nsp = nsp;
		this.gameRepo = gameRepo;
		//setting up starting state
		this.transitionTo(state);
	}

	public getId(): string {
		return this.fsmId;
	}

	public getUsers(): User[] {
		return this.users;
	}

	public getRoomString(): string {
		return this.roomString;
	}

	public getNamespace(): SocketIO.Namespace {
		return this.nsp;
	}

	public transitionTo(nextState: State): void {
		this.state = nextState;
		this.state.setContext(this);
	}

	public gameStarted(game: ServerGame): void {
		this.gameRepo.addGame(game);
	}

	public gameFinished(game: ServerGame): void {
		this.gameRepo.deleteGameById(game.getGameId());
	}

	public userJoined(user: User): void {
		this.users.push(user);
		this.state.userJoined(user);
	}

	public userLeft(user: User): void {
		this.users = this.users.filter((u) => u.userId !== user.userId);
		this.state.userLeft(user);
	}
}