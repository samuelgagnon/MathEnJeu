import State from "./state";
import RaceGame from "./raceGame";
import Player from "../player";
import User from "../../server/data/user";
import { v4 as uuidv4 } from "uuid";

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
		const raceGame = new RaceGame("1");
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
