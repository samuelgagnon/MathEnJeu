import State from "./state";
import User from "../../server/data/user";
import StateFactory from "./stateFactory";

export default class PreGame extends State {
	private tick: number = 0;

	constructor() {
		super();
		this.handleSocketEvent();
		this.waitingForPlayers();
	}

	public userJoined(user: User): void {}

	public userLeft(user: User): void {}

	private startRaceGame(): void {
		const raceGame = StateFactory.createRaceGame();
		this.context.gameStarted(raceGame);
		this.context.transitionTo(raceGame);
	}

	private waitingForPlayers(): void {
		setTimeout(() => {
			if (this.tick < 3) {
				this.tick += 1;
				console.log(`Room is Waiting for more players...`);
				this.waitingForPlayers();
			} else {
				this.startRaceGame();
			}
		}, 1000);
	}

	private handleSocketEvent(): void {}
}
