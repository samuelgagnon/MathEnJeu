import randomNormal from "random-normal";
import { Clock } from "../../../clock/Clock";
import Move from "../../Move";
import Inventory from "../Inventory";
import Player from "../Player";
import { TargetablePlayers } from "../playerRepository/PlayerRepository";
import Status from "../playerStatus/Status";
import PathFinder from "./PathFinder";

export default class ComputerPlayer extends Player {
	private nextActionTimestamp: number;
	private answeringQuestionTimestamp: number;
	private isReadyForNextAction: boolean = true;
	private pathFinder: PathFinder;
	private pathToFollow: Point[] = [];
	private checkpointPositions: Point[][];
	private targetablePlayers: TargetablePlayers;
	//In seconds. The centre of the normal curve
	private readonly MEAN_TIME: number = 30;
	//In seconds The deviation for the normal curve. If mean is 30 and deviation is 10, then 70% of the values will be between 20 and 40
	private readonly DEVIATION_TIME: number = 10;
	private readonly ANSWERING_TIME: number = 3;

	constructor(
		id: string,
		startLocation: Point,
		name: string,
		status: Status,
		inventory: Inventory,
		gameStartTimestamp: number,
		pathFinder: PathFinder,
		checkpointPositions: Point[][],
		targetablePlayers: TargetablePlayers,
		pointsCalculator: (moveDistance: number) => number
	) {
		super(id, startLocation, name, status, inventory, pointsCalculator);
		this.nextActionTimestamp = gameStartTimestamp;
		this.answeringQuestionTimestamp = gameStartTimestamp + this.ANSWERING_TIME;
		this.pathFinder = pathFinder;
		this.checkpointPositions = checkpointPositions;
		this.targetablePlayers = targetablePlayers;
	}

	public update(): void {
		super.update();
		this.handleActions();
	}

	public promptQuestion(): void {
		super.promptQuestion();
		this.answeringQuestionTimestamp = this.nextActionTimestamp + this.ANSWERING_TIME * 1000;
	}

	private handleActions(): void {
		if (this.isReadyForNextAction && this.nextActionTimestamp <= Clock.now()) {
			//TODO: add logic to throw a banana here or use any other item.
			if (this.getInventory().getInventoryState().bananaCount > 0 && Math.random() * 0.3) {
				this.targetablePlayers.getAllPlayers()[Math.floor(Math.random() * this.targetablePlayers.getAllPlayers().length)];
			}
			this.promptQuestion();
			this.isReadyForNextAction = false;
		} else if (this.answeringQuestionTimestamp <= Clock.now() && this.isAnsweringQuestion()) {
			this.answeredQuestion(true);
			this.moveTo(Clock.now(), this.getNextPosition());
			this.setTimeForNextAction();
		}

		if (this.hasArrived() && !this.isAnsweringQuestion()) {
			this.isReadyForNextAction = true;
		}
	}

	private getNextPosition(): Point {
		if (this.pathToFollow.length === 0) {
			this.pathToFollow = this.pathFinder.findPath(this.getPosition(), this.findNextCheckpoint());
		}

		return this.selectRandomPositionFromPath();
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
		this.nextActionTimestamp = Clock.now() + randomNormal({ mean: this.MEAN_TIME, dev: this.DEVIATION_TIME }) * 1000;
	}
}
