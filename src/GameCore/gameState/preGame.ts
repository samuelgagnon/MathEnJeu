import { Socket } from "socket.io";
import User from "../../server/data/user";
import GameFSM from "./gameFSM";
import State from "./state";
import StateFactory from "./stateFactory";

export default class PreGame implements State {
	private context: GameFSM;

	constructor() {
		this.handleAllUsersSocketEvents();
	}

	public setContext(context: GameFSM): void {
		this.context = context;
	}

	public userJoined(user: User): void {
		this.handleSocketEvents(user.socket);
	}

	public userLeft(user: User): void {
		this.removeSocketEvents(user.socket);
	}

	private startRaceGame(): void {
		const raceGame = StateFactory.createRaceGame(this.context.getId());
		this.context.gameStarted(raceGame);
		this.context.transitionTo(raceGame);
		this.removeAllUsersSocketEvents();
	}

	private handleAllUsersSocketEvents(): void {
		//When first initialized, the context doesn't exist yet so we don't need to initialize socketEvents
		if (this.context !== undefined) {
			const users = this.context.getUsers();
			users.forEach((user) => this.handleSocketEvents(user.socket));
		}
	}

	private removeAllUsersSocketEvents(): void {
		const users = this.context.getUsers();
		users.forEach((user) => this.removeSocketEvents(user.socket));
	}

	private handleSocketEvents(socket: Socket): void {}

	private removeSocketEvents(socket: Socket): void {}
}
