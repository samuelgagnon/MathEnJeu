import { Clock } from "../../../clock/Clock";
import Inventory from "../Inventory";
import Player from "../Player";
import Status from "../playerStatus/Status";
import PathFinder from "./PathFinder";

export default class ComputerPlayer extends Player {
	private difficulty: Difficulty;
	private nextActionTimeStamp: number;
	private isReadyForNextAction: boolean;
	private pathFinder: PathFinder;
	private pathToFollow: Point[] = [];
	private checkpointPositions: Point[][];
	private pointsCalculator: (moveDistance: number) => number;

	constructor(
		id: string,
		startLocation: Point,
		name: string,
		status: Status,
		inventory: Inventory,
		schoolGrade: number,
		language: string,
		difficulty: Difficulty,
		nextActionTimeStamp: number,
		pathFinder: PathFinder,
		checkpointPositions: Point[][],
		pointsCalculator: (moveDistance: number) => number
	) {
		super(id, startLocation, name, status, inventory, schoolGrade, language);
		this.difficulty = difficulty;
		this.nextActionTimeStamp = nextActionTimeStamp;
		this.pathFinder = pathFinder;
		this.checkpointPositions = checkpointPositions;
		this.pointsCalculator = pointsCalculator;
	}

	public handleActions(): void {
		//console.log(`Computer players array: ${this.id}`);
		if (this.isReadyForNextAction) {
			// && this.nextActionTimeStamp <= Clock.now()
			if (this.generateRandomValue()) {
				this.moveTo(Clock.now(), this.getNextPosition(), this.pointsCalculator);
			}

			this.setTimeForNextAction();
			this.isReadyForNextAction = false;
		}
		if (this.hasArrived()) this.isReadyForNextAction = true;
	}

	private getNextPosition(): Point {
		if (this.pathToFollow.length === 0) {
			this.pathToFollow = this.pathFinder.findPath(this.getPosition(), this.findNextCheckpoint());
		}

		return this.pathToFollow.shift();
	}

	public generateRandomValue(): boolean {
		return Math.random() < this.difficulty;
	}

	private findNextCheckpoint(): Point {
		const nextCheckpoints = this.checkpointPositions.shift();
		this.checkpointPositions.push(nextCheckpoints);
		return nextCheckpoints[Math.floor(Math.random() * nextCheckpoints.length)]; //to select a random checkpoint positions from all possible checkpoint positions
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
