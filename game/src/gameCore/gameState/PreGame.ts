import { Socket } from "socket.io";
import { CLIENT_EVENT_NAMES } from "../../communication/race/EventNames";
import { CancelGameInitializationEvent, GameOptions, InitializeGameEvent } from "../../communication/room/EventInterfaces";
import { WAITING_ROOM_EVENT_NAMES } from "../../communication/room/EventNames";
import { Clock } from "../clock/Clock";
import Room from "../../server/rooms/Room";
import User from "../../server/rooms/User";
import ServerRaceGameFactory from "../race/ServerRaceGameFactory";
import State, { GameState } from "./State";

export default class PreGame implements State {
	readonly GAME_INITIALIZATION_DURATION = 10 * 1000; //in milliseconds
	private context: Room;
	private state: GameState = GameState.PreGame;
	private gameInitializationTimeout: NodeJS.Timeout;

	constructor(users: User[] = []) {
		this.handleAllUsersSocketEvents(users);
	}

	public getStateType(): GameState {
		return this.state;
	}

	public setContext(context: Room): void {
		this.context = context;
		this.context.unreadyUsers();
	}

	public userJoined(user: User): void {
		this.handleSocketEvents(user.socket);
	}

	public setFullFilled(): void {
		this.state = GameState.FillFulled;
	}

	public setPreGame(): void {
		this.state = GameState.PreGame;
	}

	public userLeft(user: User): void {
		this.state = GameState.PreGame;
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
			// if (this.context.areUsersReady()) {
			if (this.gameInitializationTimeout) {
				clearTimeout(this.gameInitializationTimeout);
				this.context.cancelGameInitialized();
			}

			this.gameInitializationTimeout = setTimeout(() => {
				let game: State;
				//TODO: add verifications
				game = this.startRaceGame(gameOptions);
				this.context.transitionTo(game);
			}, this.GAME_INITIALIZATION_DURATION);
			this.context.gameInitialized(Clock.now() + this.GAME_INITIALIZATION_DURATION);
		});

		socket.on(WAITING_ROOM_EVENT_NAMES.SERVER_EVENT.CANCEL_GAME_INITIALIZATION, () => {
			clearTimeout(this.gameInitializationTimeout);
			this.context.cancelGameInitialized();
		});
	}

	private removeSocketEvents(socket: Socket): void {
		socket.removeAllListeners(CLIENT_EVENT_NAMES.GAME_CREATED);
	}
}
