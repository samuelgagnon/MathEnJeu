import { InfoForQuestion } from "../../../communication/race/DataInterfaces";
import { Clock } from "../../clock/Clock";
import { Answer } from "../question/Answer";
import { Question } from "../question/Question";
import Inventory from "./Inventory";
import Player from "./Player";
import Status from "./playerStatus/Status";

export default class HumanPlayer extends Player {
	private schoolGrade: number;
	private language: string;
	private lastQuestionPromptTimestamp: number;
	private activeQuestion: Question;
	private answeredQuestionsId: number[] = []; //includes all answered questions' id, no matter if the answer was right or wrong.

	constructor(
		id: string,
		startLocation: Point,
		name: string,
		status: Status,
		inventory: Inventory,
		schoolGrade: number,
		language: string,
		pointsCalculator: (moveDistance: number) => number
	) {
		super(id, startLocation, name, status, inventory, pointsCalculator);
		this.schoolGrade = schoolGrade;
		this.language = language;
	}

	public getInfoForQuestion(): InfoForQuestion {
		return {
			schoolGrade: this.schoolGrade,
			language: this.language,
		};
	}

	public isAnsweringQuestion(): boolean {
		return this.activeQuestion !== undefined;
	}

	public promptQuestion(question?: Question): void {
		super.promptQuestion();
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
		super.answeredQuestion(isAnswerCorrect);
	}

	public getAnsweredQuestionsId(): number[] {
		return this.answeredQuestionsId;
	}

	public resetAnsweredQuestionsId(): void {
		this.answeredQuestionsId = [];
	}
}
