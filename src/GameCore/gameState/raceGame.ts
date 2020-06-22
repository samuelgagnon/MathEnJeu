import { Socket } from "socket.io";
import User from "../../server/data/user";
import Game from "../game";
import State from "./state";
import StateFactory from "./stateFactory";

export default class RaceGame extends State implements Game {
	private gameId: string;
	private tick: number = 0;

	constructor(gameId: string) {
		super();
		this.gameId = gameId;
		this.handleAllUsersSocketEvents();
	}

	getGameId(): string {
		return this.gameId;
	}

	update(): void {
		if (this.tick < 5) {
			this.tick += 1;
			console.log(`game ${this.gameId} currently playing on tick: ${this.tick}`);
		} else {
			this.gameFinished();
		}
	}

	private gameFinished() {
		this.removeAllUsersSocketEvents();
		this.context.gameFinished(this);
		this.context.transitionTo(StateFactory.createPreGame());
	}

	public userJoined(user: User): void {
		this.handleSocketEvents(user.socket);
	}

	public userLeft(user: User): void {
		this.removeSocketEvents(user.socket);
	}

	private handleSocketEvents(socket: Socket): void {}

	private removeSocketEvents(socket: Socket): void {}

	private handleAllUsersSocketEvents(): void {
		const users = this.context.getUsers();
		users.forEach((user) => this.handleSocketEvents(user.socket));
	}

	private removeAllUsersSocketEvents(): void {
		const users = this.context.getUsers();
		users.forEach((user) => this.handleSocketEvents(user.socket));
	}
}
