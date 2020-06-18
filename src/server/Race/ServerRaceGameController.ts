import SocketEvent from "../../Communication/SocketEvent";
import Player from "../../GameCore/player";
import RaceGameController from "../../GameCore/Race/RaceGameController";

export default class ServerRaceGameController extends RaceGameController {
	private inputBuffer: SocketEvent[] = [];

	constructor(players: Player[]) {
		super(players);
	}

	update() {
		this.gameLogicUpdate();
		this.playersUpdate();
	}

	private playersUpdate() {}

	public getGameState() {}
}
