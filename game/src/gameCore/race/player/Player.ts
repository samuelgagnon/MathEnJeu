import { PlayerDTO } from "../../../communication/race/PlayerDTO";
import PlayerState from "../../../communication/race/PlayerState";
import { Clock } from "../../clock/Clock";
import Character from "../character/Character";
import Item, { ItemType } from "../items/Item";
import Move from "../Move";
import { Question } from "../question/Question";
import { RACE_PARAMETERS } from "../RACE_PARAMETERS";
import Inventory from "./Inventory";
import { QuestionState } from "./playerStatus/QuestionState";
import Status from "./playerStatus/Status";
import { StatusType } from "./playerStatus/StatusType";

/**
 * Player is a class that implements a finite state machine. The state will changed depending on the action of the Player class and its
 * behavior will also be affected depending of the state it is currently in.
 */

export default class Player {
	private _id: string;
	private readonly PENALTY_DURATION = 5 * 1000; //in milliseconds
	private readonly MAX_BRAINIAC_MOVEMENT = 7;
	private readonly MAX_MOVEMENT = 6;
	private readonly MIN_MOVEMENT = 1;
	protected readonly MOVE_PER_QUESTION = 1;
	protected questionState: QuestionState = QuestionState.NoQuestionState; //value will be changed to true depending on its child class
	protected endOfPenaltyTimestamp: number = 0;
	private maxPossibleMoveDistance: number = 3;
	private playerStatus: Status;
	private name: string;
	private points: number = 0;
	private position: Point;
	private move: Move;
	private inventory: Inventory;
	private lastValidCheckpoint: number = 0;
	private character: Character;
	public pointsCalculator: (moveDistance: number) => number;

	constructor(
		id: string,
		startLocation: Point,
		name: string,
		status: Status,
		inventory: Inventory,
		character: Character,
		pointsCalculator: (moveDistance: number) => number
	) {
		this._id = id;
		this.position = startLocation;
		this.move = new Move(Clock.now(), startLocation, startLocation);
		this.name = name;
		this.inventory = inventory;
		this.character = character;
		this.pointsCalculator = pointsCalculator;
		this.transitionTo(status);
	}

	public get id(): string {
		return this._id;
	}

	public update(): void {
		this.updatePosition();
		this.playerStatus.update();
		this.updateQuestionState();
	}

	public updateFromPlayerState(playerState: PlayerState, lag: number): void {
		if (!playerState) return;

		this.points = playerState.points;
		this.inventory.updateInventoryFromState(playerState.inventoryState);
		this.playerStatus.updateFromState({
			statusTimestamp: playerState.statusState.statusTimestamp + lag,
			statusType: playerState.statusState.statusType,
		});
		this.move.updateFromMoveState({
			startTimestamp: playerState.move.startTimestamp + lag,
			startLocation: playerState.move.startLocation,
			targetLocation: playerState.move.targetLocation,
		});
		this.questionState = playerState.questionState;
	}

	public getPlayerDTO(): PlayerDTO {
		return {
			name: this.name,
			character: this.character,
			state: this.getPlayerState(),
		};
	}

	public getPlayerState(): PlayerState {
		let answeringState: QuestionState;
		if (this.isInPenaltyState()) {
			answeringState = QuestionState.PenaltyState;
		} else if (this.isWorkingOnQuestion()) {
			answeringState = QuestionState.AnsweringState;
		} else {
			answeringState = QuestionState.NoQuestionState;
		}
		return {
			playerId: this.id,
			points: this.points,
			statusState: { statusType: this.playerStatus.getCurrentStatus(), statusTimestamp: this.playerStatus.getStartTimeStatus() },
			move: this.move.getMoveState(),
			inventoryState: this.inventory.getInventoryState(),
			questionState: answeringState,
		};
	}

	public getId(): string {
		return this.id;
	}

	public getCurrentStatus(): StatusType {
		return this.playerStatus.getCurrentStatus();
	}

	public getStatusRemainingTime(): number {
		return this.playerStatus.getRemainingTime();
	}

	public getInventory(): Inventory {
		return this.inventory;
	}

	public getCharacter(): Character {
		return this.character;
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
		let difficulty = Move.getTaxiCabDistance(this.position, targetLocation);
		if (this.playerStatus.getCurrentStatus() == StatusType.BrainiacStatus) difficulty--;
		if (difficulty < RACE_PARAMETERS.QUESTION.MIN_DIFFICULTY) difficulty = RACE_PARAMETERS.QUESTION.MIN_DIFFICULTY;
		if (difficulty > RACE_PARAMETERS.QUESTION.MAX_DIFFICULTY) difficulty = RACE_PARAMETERS.QUESTION.MAX_DIFFICULTY; //Max difficulty is 6 even though we can move by 6 tiles
		return difficulty;
	}

	/**
	 * Use it when a question is answered correctly
	 * @param pointsCalculatorCallBack callback function that allows its caller to choose which method it uses for the player to calculate its points.
	 */
	public moveTo(startTimestamp: number, targetLocation: Point): void {
		const isMoveDiagonal = Move.isDiagonal(this.getPosition(), targetLocation);
		//diagonal movement is not permitted
		if (this.move.getHasArrived() && !isMoveDiagonal) {
			// && !this.isInPenaltyState()
			this.move = new Move(startTimestamp, this.position, targetLocation);
			this.addPoints(this.pointsCalculator(this.move.getDistance()));
		}
	}

	public getMaxMovementDistance(): number {
		return this.maxPossibleMoveDistance;
	}

	private addPoints(points: number): void {
		this.points += points;
	}

	public passingByCheckpoint(checkpointGroup: number): void {
		if (Math.abs(checkpointGroup - this.lastValidCheckpoint) == 1) this.lastValidCheckpoint = checkpointGroup;
	}

	public passingByFinishLine(): boolean {
		const isLapCompleted = this.lastValidCheckpoint == RACE_PARAMETERS.CIRCUIT.NUMBER_OF_CHECKPOINTS;
		if (isLapCompleted) {
			this.addPoints(RACE_PARAMETERS.CIRCUIT.POINTS_FOR_LAP);
		}
		this.lastValidCheckpoint = 0;
		return isLapCompleted;
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

	public updateQuestionState(): void {
		if (Clock.now() < this.endOfPenaltyTimestamp) {
			this.questionState = QuestionState.PenaltyState;
		}
	}

	//Working on a question includes answering it or looking at its feedback
	public isWorkingOnQuestion(): boolean {
		return this.questionState != QuestionState.NoQuestionState;
	}

	public promptQuestion(question?: Question) {
		this.questionState = QuestionState.AnsweringState;
	}

	public useItemType(itemType: ItemType, target: Player): void {
		const usedItem = this.inventory.getItem(itemType);

		//if he's not anwsering a question and it's only usable during a question.
		if (!this.isWorkingOnQuestion() && usedItem.isForAnsweringQuestion) throw new Error(itemType); //TODO: create specific error type

		usedItem.use(target, this);
		this.inventory.removeItem(itemType);
	}

	public answeredQuestion(isAnswerCorrect: boolean): void {
		if (isAnswerCorrect) {
			this.addToMoveDistance(this.MOVE_PER_QUESTION);
			this.questionState = QuestionState.NoQuestionState;
		} else {
			this.givePenalty();
			this.addToMoveDistance(-this.MOVE_PER_QUESTION);
		}
	}

	private givePenalty(): void {
		this.endOfPenaltyTimestamp = Clock.now() + this.PENALTY_DURATION;
	}

	public isInPenaltyState(): boolean {
		return this.questionState == QuestionState.PenaltyState;
	}

	public getEndOfPenaltyTimestamp(): number {
		return this.endOfPenaltyTimestamp;
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
