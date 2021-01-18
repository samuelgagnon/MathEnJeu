import { Socket } from "socket.io";
import { GameOptions } from "../../communication/race/DataInterfaces";
import { CLIENT_EVENT_NAMES } from "../../communication/race/EventNames";
import User from "../../server/data/User";
import Room from "../../server/rooms/Room";
import ServerRaceGameFactory from "../race/ServerRaceGameFactory";
import State, { GameState } from "./State";

export default class PreGame implements State {
	private context: Room;
	private state: GameState = GameState.PreGame;

	constructor(users: User[] = []) {
		this.handleAllUsersSocketEvents(users);
	}

	public getStateType(): GameState {
		return this.state;
	}

	public setContext(context: Room): void {
		this.context = context;
	}

	public userJoined(user: User): void {
		this.handleSocketEvents(user.socket);
	}

	public userLeft(user: User): void {
		this.removeSocketEvents(user.socket);
	}

	private startRaceGame(gameOptions: GameOptions): State {
		const raceGame = ServerRaceGameFactory.createServer(this.context.getId(), this.context.getUsers(), gameOptions);
		this.removeAllUsersSocketEvents();
		this.context.addGameToRepo(raceGame);

		return raceGame;
	}

	private handleAllUsersSocketEvents(users: User[]): void {
		users.forEach((user) => this.handleSocketEvents(user.socket));
	}

	private removeAllUsersSocketEvents(): void {
		const users = this.context.getUsers();
		users.forEach((user) => this.removeSocketEvents(user.socket));
	}

	private handleSocketEvents(socket: Socket): void {
		/**
		 * Rethink implementation when there are multiple game modes added.
		 * First idea was to just add un switch statement here depending on the mode and then add multiple "startTypeGame(gameOptions)",
		 * but maybe have one single function startGame that implements that switch case and creates the game depending on gameOptions
		 **/
		socket.on(CLIENT_EVENT_NAMES.GAME_INITIALIZED, (gameOptions: GameOptions) => {
			let game: State;
			//TODO: add verifications
			game = this.startRaceGame(gameOptions);
			this.context.transitionTo(game);
		});
	}

	private removeSocketEvents(socket: Socket): void {
		socket.removeAllListeners(CLIENT_EVENT_NAMES.GAME_START);
	}
}
