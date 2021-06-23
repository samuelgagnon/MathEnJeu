import randomNormal from "random-normal";
import { Clock } from "../../../clock/Clock";
import { ItemType } from "../../items/Item";
import Move from "../../Move";
import Inventory from "../Inventory";
import Player from "../Player";
import { TargetablePlayers } from "../playerRepository/PlayerRepository";
import { QuestionState } from "../playerStatus/QuestionState";
import Status from "../playerStatus/Status";
import PathFinder from "./PathFinder";

export default class ComputerPlayer extends Player {
	private nextActionTimestamp: number;
	private isReadyForNextAction: boolean = true;
	private pathFinder: PathFinder;
	private pathToFollow: Point[] = [];
	private checkpointPositions: Point[][];
	private targetablePlayers: TargetablePlayers;
	private readonly BANANA_USE_PROBABILITY: number = 0.3;
	//In milliseconds. The average time needed for a ComputerPlayer to answer a question.
	private readonly ANSWERING_TIME_AVG: number = 30 * 1000;
	//In milliseconds. The standard deviation for ComputerPlayer answering time.
	//If the average answering time is 30 sec and the standard deviation is 10,
	//then 70% of the times, the time needed for a ComputerPlayer to answer a question will be between 20 and 40 sec.
	private readonly ANSWERING_TIME_SD: number = 10 * 1000;
	//In milliseconds. The minimum amount of time needed for a ComputerPlayer to answer a question.
	private readonly ANSWERING_TIME_MIN: number = 3 * 1000;

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
	}

	private handleActions(): void {
		if (Clock.now() >= this.nextActionTimestamp) {
			if (this.isReadyForNextAction) {
				//TODO: add logic to throw a banana here or use any other item.
				if (this.getInventory().getInventoryState().bananaCount > 0 && Math.random() < this.BANANA_USE_PROBABILITY) {
					const targetedPlayer = this.targetablePlayers.getAllPlayers()[Math.floor(Math.random() * this.targetablePlayers.getAllPlayers().length)];
					this.useItemType(ItemType.Banana, targetedPlayer);
				}
				this.promptQuestion();
				this.isReadyForNextAction = false;
				this.setTimeForNextAction();
				super.questionState = QuestionState.AnsweringState;
				//ComputerPlayer always has the right answer. It just takes a random amount of time before it gives its answer.
			} else if (this.isWorkingOnQuestion()) {
				this.answeredQuestion(true);
				this.moveTo(Clock.now(), this.getNextPosition());
				super.questionState = QuestionState.NoQuestionState;
			}
		}

		if (this.hasArrived() && !this.isWorkingOnQuestion()) {
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
		this.nextActionTimestamp = Clock.now() + this.generateTimeBeforeNextAction();
	}

	private generateTimeBeforeNextAction(): number {
		let timeBeforeNextAction = randomNormal({ mean: this.ANSWERING_TIME_AVG, dev: this.ANSWERING_TIME_SD });
		if (timeBeforeNextAction < this.ANSWERING_TIME_MIN) timeBeforeNextAction = this.ANSWERING_TIME_MIN;
		return timeBeforeNextAction;
	}
}
