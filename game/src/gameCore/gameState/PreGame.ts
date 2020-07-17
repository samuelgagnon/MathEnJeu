import { Socket } from "socket.io";
import { CLIENT_EVENT_NAMES } from "../../communication/race/EventNames";
import User from "../../server/data/User";
import RaceGameFactory from "../race/RaceGameFactory";
import GameFSM from "./GameFSM";
import State from "./State";

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
		const raceGame = RaceGameFactory.createServer(this.context.getId(), this.context.getUsers());
		this.removeAllUsersSocketEvents();
		console.log("Race game starts !");
		this.context.gameStarted(raceGame);
		this.context.transitionTo(raceGame);
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

	private handleSocketEvents(socket: Socket): void {
		socket.on(CLIENT_EVENT_NAMES.GAME_START, () => {
			this.startRaceGame();
		});
	}

	private removeSocketEvents(socket: Socket): void {
		socket.removeAllListeners(CLIENT_EVENT_NAMES.GAME_START);
	}
}
