import State from "./state";
import RaceGame from "./raceGame";
import Player from "../player";

export default class PreGame extends State {
	private players: Player[];
	private nsp: SocketIO.Namespace;

	constructor() {
		super();
		this.handleSocketEvent();
	}

	private startRaceGame(): void {
		this.context.transitionTo(new RaceGame());
	}

	private handleSocketEvent(): void {}
}
