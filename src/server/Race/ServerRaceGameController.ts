import { Socket } from "socket.io";
import SocketEvent from "../../Communication/SocketEvent";
import GameFSM from "../../GameCore/gameState/gameFSM";
import StateFactory from "../../GameCore/gameState/stateFactory";
import RaceGameController from "../../GameCore/Race/RaceGameController";
import User from "../data/user";

export default class ServerRaceGameController extends RaceGameController {
	private context: GameFSM;
	private tick: number;
	private inputBuffer: SocketEvent[] = [];

	constructor(gameId: string) {
		super(gameId);
	}

	public setContext(context: GameFSM): void {
		this.context = context;
	}

	//necessary ?
	public getGameId(): string {
		return this.context.getId();
	}

	public update(): void {
		if (this.tick < 5) {
			this.tick += 1;
			console.log(`game ${this.getGameId()} currently playing on tick: ${this.tick}`);
			this.gameLogicUpdate();
			this.playersUpdate();
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

	private playersUpdate() {}

	public getGameState() {}
}
