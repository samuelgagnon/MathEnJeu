import { Clock } from "../../clock/Clock";
import Inventory from "./Inventory";
import Player from "./Player";
import Status from "./playerStatus/Status";

export default class ComputerPlayer extends Player {
	private difficulty: Difficulty;
	private nextActionTimeStamp: number;

	constructor(
		id: string,
		startLocation: Point,
		name: string,
		status: Status,
		inventory: Inventory,
		schoolGrade: number,
		language: string,
		difficulty: Difficulty
	) {
		super(id, startLocation, name, status, inventory, schoolGrade, language);
		this.difficulty = difficulty;
	}

	public handleActions(): void {
		const maxPossibleMoveDistance = this.getMaxMovementDistance();
	}

	private setTimeForNextAction(): void {
		let timeForNextAction: number;

		switch (this.difficulty) {
			case Difficulty.EASY:
				timeForNextAction = 15;
				break;

			case Difficulty.MEDIUM:
				timeForNextAction = 10;
				break;

			case Difficulty.HARD:
				timeForNextAction = 10;
				break;

			default:
				break;
		}

		//1000 milliseconds in 1 second
		this.nextActionTimeStamp = Clock.now() + timeForNextAction * 1000;
	}
}

enum Difficulty {
	EASY,
	MEDIUM,
	HARD,
}
