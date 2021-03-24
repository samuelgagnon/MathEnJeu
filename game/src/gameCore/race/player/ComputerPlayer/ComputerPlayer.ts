import { Clock } from "../../../clock/Clock";
import Move from "../../Move";
import Inventory from "../Inventory";
import Player from "../Player";
import Status from "../playerStatus/Status";
import PathFinder from "./PathFinder";

export default class ComputerPlayer extends Player {
	private difficulty: Difficulty;
	private nextActionTimeStamp: number;
	private isReadyForNextAction: boolean = true;
	private pathFinder: PathFinder;
	private pathToFollow: Point[] = [];
	private checkpointPositions: Point[][];

	constructor(
		id: string,
		startLocation: Point,
		name: string,
		status: Status,
		inventory: Inventory,
		difficulty: Difficulty,
		gameStartTimestamp: number,
		pathFinder: PathFinder,
		checkpointPositions: Point[][],
		pointsCalculator: (moveDistance: number) => number
	) {
		super(id, startLocation, name, status, inventory, pointsCalculator);
		this.difficulty = difficulty;
		this.nextActionTimeStamp = gameStartTimestamp;
		this.pathFinder = pathFinder;
		this.checkpointPositions = checkpointPositions;
	}

	public update(): void {
		super.update();
		this.handleActions();
	}

	private handleActions(): void {
		if (this.isReadyForNextAction && this.nextActionTimeStamp <= Clock.now()) {
			if (this.generateRandomValue()) {
				this.moveTo(Clock.now(), this.getNextPosition());
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

		return this.selectRandomPositionFromPath();
	}

	public generateRandomValue(): boolean {
		return Math.random() < this.difficulty;
	}

	private findNextCheckpoint(): Point {
		const nextCheckpoints = this.checkpointPositions.shift();
		this.checkpointPositions.push(nextCheckpoints);
		return nextCheckpoints[Math.floor(Math.random() * nextCheckpoints.length)]; //to select a random checkpoint positions from all possible checkpoint positions
	}

	/**
	 * Selects and returns an accessible point to the ComputerPlayer within its movable distance and removes everyone before it.
	 * @returns The selected point where the computer player will move to.
	 */
	private selectRandomPositionFromPath(): Point {
		let possibleIndexes: number[] = [];
		this.pathToFollow.forEach((point: Point, i: number) => {
			const isDiagonal = Move.isDiagonal(this.getPosition(), point);
			const distanceFromCurrentPosition = Move.getTaxiCabDistance(this.getPosition(), point);
			if (!isDiagonal && distanceFromCurrentPosition <= this.getMaxMovementDistance()) {
				possibleIndexes.push(i);
			}
		});

		const randomIndex = possibleIndexes[Math.floor(Math.random() * possibleIndexes.length)];
		const selectedPosition = this.pathToFollow[randomIndex];
		this.pathToFollow.splice(0, randomIndex + 1);

		return selectedPosition;
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
