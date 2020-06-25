import Status from "./playerStatus/playerStatus";

export default class PlayerFSM {
	private playerId: string;
	private playerStatus: Status;
	private isAnsweringQuestion: boolean = false;

	constructor(playerId: string, status: Status) {
		this.playerId = playerId;
		this.transitionTo(status);
	}

	public transitionTo(status: Status) {
		this.playerStatus = status;
		this.playerStatus.setContext(this);
	}
}
