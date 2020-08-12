import PlayerState from "../../../communication/race/PlayerState";
import Item, { ItemType } from "../items/Item";
import Move from "../Move";
import { RACE_CST } from "../RACE_CST";
import Inventory from "./Inventory";
import Status from "./playerStatus/Status";
import { StatusType } from "./playerStatus/StatusType";

/**
 * Player is a class that implements a finite state machine. The state will changed depending on the action of the Player class and its
 * behavior will also be affected depending of the state it is currently in.
 */

export default class Player {
	readonly id: string;
	private readonly MAX_BRAINIAC_MOVEMENT = 7;
	private readonly MAX_MOVEMENT = 6;
	private readonly MIN_MOVEMENT = 1;
	private readonly MOVE_PER_QUESTION = 1;
	private maxPossibleMoveDistance: number = 3;
	private missedQuestionsCount: number = 0;
	private playerStatus: Status;
	private isAnsweringQuestion: boolean = false;
	private name: string;
	private points: number = 0;
	private position: Point;
	private move: Move;
	private inventory: Inventory;
	private answeredQuestionsId: Number[] = []; //includes all answered questions' id, no matter if the answer was right or wrong.
	private lastValidCheckpoint: number = 0;
	private schoolGrade: number;
	private language: string;

	constructor(id: string, startLocation: Point, name: string, status: Status, inventory: Inventory) {
		this.id = id;
		this.position = startLocation;
		this.move = new Move(Date.now(), startLocation, startLocation);
		this.name = name;
		this.inventory = inventory;
		this.transitionTo(status);
	}

	public update(): void {
		this.updatePosition();
		this.playerStatus.update();
	}

	public updateFromPlayerState(playerState: PlayerState): void {
		if (!playerState) return;

		this.points = playerState.points;
		this.inventory.updateInventoryFromState(playerState.inventoryState);
		this.playerStatus.updateFromState(playerState.statusState);
		this.move.updateFromMoveState(playerState.move);
	}

	public getPlayerState(): PlayerState {
		return {
			id: this.id,
			name: this.name,
			points: this.points,
			statusState: { statusType: this.playerStatus.getCurrentStatus(), statusTimestamp: this.playerStatus.getStartTimeStatus() },
			move: this.move.getMoveState(),
			isAnsweringQuestion: this.isAnsweringQuestion,
			missedQuestionsCount: this.missedQuestionsCount,
			inventoryState: this.inventory.getInventoryState(),
		};
	}

	public getCurrentStatus(): StatusType {
		return this.playerStatus.getCurrentStatus();
	}

	public getStatusRemainingTime(): number {
		return this.playerStatus.getRemainingTime();
	}

	public getIsAnsweringQuestion(): boolean {
		return this.isAnsweringQuestion;
	}

	public setIsAnsweringQuestion(value: boolean) {
		this.isAnsweringQuestion = value;
	}

	public getInventory(): Inventory {
		return this.inventory;
	}

	public getPoints(): number {
		return this.points;
	}

	public transitionTo(status: Status) {
		this.playerStatus = status;
		this.playerStatus.setContext(this);
	}

	public getPosition(): Point {
		return this.position;
	}

	public getMove(): Move {
		return this.move;
	}

	public hasArrived(): boolean {
		return this.move.getHasArrived();
	}

	public getDifficulty(targetLocation: Point): number {
		return Move.getTaxiCabDistance(this.position, targetLocation);
	}

	public answeredQuestion(isAnswerCorrect: boolean): void {
		this.setIsAnsweringQuestion(false);
		if (isAnswerCorrect) {
			this.addToMoveDistance(this.MOVE_PER_QUESTION);
		} else {
			this.addToMoveDistance(-this.answeredQuestion);
		}
	}

	//Happens when a question is answered correctly
	public moveTo(startTimestamp: number, targetLocation: Point): void {
		const isMoveDiagonal = Math.abs(targetLocation.x - this.position.x) > 0 && Math.abs(targetLocation.y - this.position.y) > 0;
		if (this.move.getHasArrived() && !isMoveDiagonal) {
			this.move = new Move(startTimestamp, this.position, targetLocation);
			this.addPointsForMove(this.move.getDistance());
			this.setIsAnsweringQuestion(false);
		}
	}

	public getMaxMovementDistance(): number {
		return this.maxPossibleMoveDistance;
	}

	private addPointsForMove(moveDistance: number): void {
		let points = 0;
		switch (moveDistance) {
			case 1:
				points = 2;
				break;
			case 2:
				points = 3;
				break;
			case 3:
				points = 5;
				break;
			case 4:
				points = 8;
				break;
			case 5:
				points = 13;
				break;
			case 6:
				points = 21;
				break;
			case 7:
				points = 34;
				break;
		}
		this.addPoints(points);
	}

	private addPoints(points: number): void {
		this.points += points;
	}

	public passingByCheckpoint(checkpointGroup: number): void {
		if (Math.abs(checkpointGroup - this.lastValidCheckpoint) == 1) this.lastValidCheckpoint = checkpointGroup;
	}

	public passingByFinishLine(): void {
		if (this.lastValidCheckpoint == RACE_CST.CIRCUIT.NUMBER_OF_CHECKPOINTS) {
			this.addPoints(RACE_CST.CIRCUIT.POINTS_FOR_LAP);
		}
		this.lastValidCheckpoint = 0;
	}

	//transitioningStatus parameter needs to be passed only when transitionning into another state.
	//Otherwise, use this method without parameters
	public addToMoveDistance(moveDistance: number, transitioningStatus: StatusType = this.getCurrentStatus()) {
		this.maxPossibleMoveDistance += moveDistance;

		if (this.maxPossibleMoveDistance > this.MAX_BRAINIAC_MOVEMENT && transitioningStatus === StatusType.BrainiacStatus) {
			this.maxPossibleMoveDistance = this.MAX_BRAINIAC_MOVEMENT;
		} else if (this.maxPossibleMoveDistance > this.MAX_MOVEMENT && transitioningStatus !== StatusType.BrainiacStatus) {
			this.maxPossibleMoveDistance = this.MAX_MOVEMENT;
		} else if (this.maxPossibleMoveDistance < this.MIN_MOVEMENT) {
			this.maxPossibleMoveDistance = this.MIN_MOVEMENT;
		}
	}

	public updatePosition(): void {
		this.position = this.move.getCurrentPosition();
	}

	public useItemType(itemType: ItemType, target: Player): void {
		const usedItem = this.inventory.getItem(itemType);

		//if he's not anwsering a question and it's only usable during a question.
		if (!this.isAnsweringQuestion && usedItem.isForAnsweringQuestion) throw new Error(itemType); //TODO: create specific error type

		usedItem.use(target, this);
		this.inventory.removeItem(itemType);
	}

	public useItem(item: Item): void {
		if (item === null) return;

		item.use(this);
	}

	public pickUpItem(item: Item): void {
		if (item === null) return;

		this.inventory.addItem(item);
	}

	public bananaReceivedFrom(from: Player): void {
		this.playerStatus.activateBananaStatus();
	}

	public activateBrainiac(): void {
		this.playerStatus.activateBrainiacStatus();
	}

	public useBook(): void {}

	public useCrystalBall(): void {}
}
