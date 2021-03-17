import { Clock } from "../../clock/Clock";
import Inventory from "./Inventory";
import Player from "./Player";
import Status from "./playerStatus/Status";

export default class ComputerPlayer extends Player {
	private difficulty: Difficulty;
	private nextActionTimeStamp: number;
	private isReadyForNextAction: boolean;
	private pointsCalculator: (moveDistance: number) => number;
	private validPositions: Point[];

	constructor(
		id: string,
		startLocation: Point,
		name: string,
		status: Status,
		inventory: Inventory,
		schoolGrade: number,
		language: string,
		difficulty: Difficulty,
		pointsCalculator: (moveDistance: number) => number
	) {
		super(id, startLocation, name, status, inventory, schoolGrade, language);
		this.difficulty = difficulty;
		this.pointsCalculator = pointsCalculator;
	}

	public handActions(): void {
		if (this.nextActionTimeStamp >= Clock.now() && this.isReadyForNextAction) {
			if (this.generateRandomValue()) {
				this.moveTo(Clock.now(), this.getRandomLocation(), this.pointsCalculator);
			}

			this.setTimeForNextAction();
			this.isReadyForNextAction = false;
		}
		if (this.hasArrived()) this.isReadyForNextAction = true;
	}

	private getRandomLocation(): Point {
		const pos = this.getPosition();
		return { x: pos.x + 1, y: pos.y };
	}

	public generateRandomValue(): boolean {
		return Math.random() < this.difficulty;
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
				timeForNextAction = 5;
				break;

			default:
				break;
		}

		//1000 milliseconds in 1 second
		this.nextActionTimeStamp = Clock.now() + timeForNextAction * 1000;
	}
}

export enum Difficulty {
	EASY = 0.2,
	MEDIUM = 0.4,
	HARD = 0.8,
}
