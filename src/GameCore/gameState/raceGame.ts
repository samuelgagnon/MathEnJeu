import State from "./state";
import User from "../../server/data/user";
import Game from "../game";
import PreGame from "./preGame";

export default class RaceGame extends State implements Game {
	private gameId: string;
	private tick: number = 0;

	constructor(gameId: string) {
		super();
		this.gameId = gameId;
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
		this.context.gameFinished(this);
		this.context.transitionTo(new PreGame());
	}

	public userJoined(user: User): void {
		this.handleSocketEvents(user.socket);
	}

	public userLeft(user: User): void {}

	private handleSocketEvents(socket: SocketIO.Socket): void {}
}
