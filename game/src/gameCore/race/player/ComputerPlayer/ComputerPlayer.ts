import { Clock } from "../../../clock/Clock";
import Move from "../../Move";
import Inventory from "../Inventory";
import Player from "../Player";
import Status from "../playerStatus/Status";
import PathFinder from "./PathFinder";

export default class ComputerPlayer extends Player {
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
		gameStartTimestamp: number,
		pathFinder: PathFinder,
		checkpointPositions: Point[][],
		pointsCalculator: (moveDistance: number) => number
	) {
		super(id, startLocation, name, status, inventory, pointsCalculator);
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
		return Math.random() < 0.5;
	}

	private findNextCheckpoint(): Point {
		const nextCheckpoints = this.checkpointPositions.shift();
		this.checkpointPositions.push(nextCheckpoints);
		return nextCheckpoints[Math.floor(Math.random() * nextCheckpoints.length)]; //to select a random checkpoint positions from all possible checkpoint positions
	}

	/**
	 * Selects and returns an accessible point to the ComputerPlayer within its generated path and
	 * its maximum movable distance. Also, removes every crossed point along the path to reach the selected point.
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
		//1000 milliseconds in 1 second
		this.nextActionTimeStamp = Clock.now() + 10 * 1000;
	}
}
