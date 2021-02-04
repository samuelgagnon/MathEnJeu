import { InfoForQuestion } from "../../../communication/race/DataInterfaces";
import PlayerState from "../../../communication/race/PlayerState";
import { Clock } from "../../clock/Clock";
import Item, { ItemType } from "../items/Item";
import Move from "../Move";
import { RACE_CST } from "../RACE_CST";
import { Answer } from "./../question/Answer";
import { Question } from "./../question/Question";
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
	private readonly MAX_DIFFICULTY = 6;
	private readonly PENALTY_DURATION = 5 * 1000; //in milliseconds
	private maxPossibleMoveDistance: number = 3;
	private missedQuestionsCount: number = 0;
	private playerStatus: Status;
	private lastQuestionPromptTimestamp: number;
	private activeQuestion: Question;
	private name: string;
	private points: number = 0;
	private position: Point;
	private move: Move;
	private inventory: Inventory;
	private answeredQuestionsId: number[] = []; //includes all answered questions' id, no matter if the answer was right or wrong.
	private lastValidCheckpoint: number = 0;
	private schoolGrade: number;
	private language: string;
	private endOfPenaltyTimestamp: number;

	constructor(id: string, startLocation: Point, name: string, status: Status, inventory: Inventory, schoolGrade: number, language: string) {
		this.id = id;
		this.position = startLocation;
		this.move = new Move(Clock.now(), startLocation, startLocation);
		this.name = name;
		this.inventory = inventory;
		this.schoolGrade = schoolGrade;
		this.language = language;
		this.endOfPenaltyTimestamp = 0;
		this.transitionTo(status);
	}

	public update(): void {
		this.updatePosition();
		this.playerStatus.update();
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
	}

	public getPlayerState(): PlayerState {
		return {
			id: this.id,
			name: this.name,
			points: this.points,
			statusState: { statusType: this.playerStatus.getCurrentStatus(), statusTimestamp: this.playerStatus.getStartTimeStatus() },
			move: this.move.getMoveState(),
			isAnsweringQuestion: this.isAnsweringQuestion(),
			missedQuestionsCount: this.missedQuestionsCount,
			inventoryState: this.inventory.getInventoryState(),
			schoolGrade: this.schoolGrade,
			language: this.language,
		};
	}

	public isInPenaltyState(): boolean {
		return Clock.now() < this.endOfPenaltyTimestamp;
	}

	public getEndOfPenaltyTimestamp(): number {
		return this.endOfPenaltyTimestamp;
	}

	public givePenalty(): void {
		this.endOfPenaltyTimestamp = Clock.now() + this.PENALTY_DURATION;
	}

	public getCurrentStatus(): StatusType {
		return this.playerStatus.getCurrentStatus();
	}

	public getStatusRemainingTime(): number {
		return this.playerStatus.getRemainingTime();
	}

	public isAnsweringQuestion(): boolean {
		return this.activeQuestion !== undefined;
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
		let difficulty = Move.getTaxiCabDistance(this.position, targetLocation);
		if (difficulty > this.MAX_DIFFICULTY) difficulty = this.MAX_DIFFICULTY; //Max difficulty is 6 even though we can move by 6 tiles
		return difficulty;
	}

	public getInfoForQuestion(): InfoForQuestion {
		return {
			schoolGrade: this.schoolGrade,
			language: this.language,
		};
	}

	public promptQuestion(question: Question): void {
		this.activeQuestion = question;
		this.lastQuestionPromptTimestamp = Clock.now();
	}

	public getActiveQuestion(): Question {
		return this.activeQuestion;
	}

	public getAnswerFromActiveQuestion(answerString: string): Answer {
		if (this.isAnsweringQuestion()) {
			return this.activeQuestion.getAnswer(answerString);
		}
		return undefined;
	}

	public getLastQuestionPromptTimestamp() {
		return this.lastQuestionPromptTimestamp;
	}

	public answeredQuestion(isAnswerCorrect: boolean): void {
		//add answered question to answeredQuestion list so you don't ask the player the same question again
		this.answeredQuestionsId.push(this.activeQuestion.getId());
		this.activeQuestion = undefined;
		if (isAnswerCorrect) {
			this.addToMoveDistance(this.MOVE_PER_QUESTION);
		} else {
			this.addToMoveDistance(-this.MOVE_PER_QUESTION);
		}
	}

	/**
	 * Use it when a question is answered correctly
	 * @param pointsCalculatorCallBack callback function that allows its caller to choose which method it uses for the player to calculate its points.
	 */
	public moveTo(startTimestamp: number, targetLocation: Point, pointsCalculatorCallBack: (moveDistance: number) => number): void {
		const isMoveDiagonal = Math.abs(targetLocation.x - this.position.x) > 0 && Math.abs(targetLocation.y - this.position.y) > 0;
		//diagonal movement is not permitted
		if (this.move.getHasArrived() && !isMoveDiagonal && !this.isInPenaltyState()) {
			this.move = new Move(startTimestamp, this.position, targetLocation);
			this.addPoints(pointsCalculatorCallBack(this.move.getDistance()));
			this.activeQuestion = undefined;
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
		if (!this.isAnsweringQuestion() && usedItem.isForAnsweringQuestion) throw new Error(itemType); //TODO: create specific error type

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
