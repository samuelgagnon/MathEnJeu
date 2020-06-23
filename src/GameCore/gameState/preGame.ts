import { Socket } from "socket.io";
import User from "../../server/data/user";
import State from "./state";
import StateFactory from "./stateFactory";

export default class PreGame extends State {
	constructor() {
		super();
		this.handleAllUsersSocketEvents();
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
		const users = this.context.getUsers();
		users.forEach((user) => this.handleSocketEvents(user.socket));
	}

	private removeAllUsersSocketEvents(): void {
		const users = this.context.getUsers();
		users.forEach((user) => this.removeSocketEvents(user.socket));
	}

	private handleSocketEvents(socket: Socket): void {}

	private removeSocketEvents(socket: Socket): void {}
}
