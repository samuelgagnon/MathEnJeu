import { Socket } from "socket.io";
import { GameOptions } from "../../communication/race/DataInterfaces";
import { CLIENT_EVENT_NAMES } from "../../communication/race/EventNames";
import User from "../../server/data/User";
import ServerRaceGameFactory from "../race/ServerRaceGameFactory";
import GameFSM from "./GameFSM";
import State, { GameState } from "./State";

export default class PreGame implements State {
	private context: GameFSM;
	private state: GameState = GameState.PreGame;

	constructor(users: User[] = []) {
		this.handleAllUsersSocketEvents(users);
	}

	public getStateType(): GameState {
		return this.state;
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

	private startRaceGame(gameOptions: GameOptions): void {
		const raceGame = ServerRaceGameFactory.createServer(this.context.getId(), this.context.getUsers(), gameOptions);
		this.removeAllUsersSocketEvents();
		this.context.gameStarted(raceGame);
		this.context.transitionTo(raceGame);
	}

	private handleAllUsersSocketEvents(users: User[]): void {
		users.forEach((user) => this.handleSocketEvents(user.socket));
	}

	private removeAllUsersSocketEvents(): void {
		const users = this.context.getUsers();
		users.forEach((user) => this.removeSocketEvents(user.socket));
	}

	private handleSocketEvents(socket: Socket): void {
		socket.on(CLIENT_EVENT_NAMES.GAME_INITIALIZED, (gameOptions: GameOptions) => {
			//TODO: add verifications
			this.startRaceGame(gameOptions);
		});
	}

	private removeSocketEvents(socket: Socket): void {
		socket.removeAllListeners(CLIENT_EVENT_NAMES.GAME_START);
	}
}
