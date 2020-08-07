import { QuestionDTO } from "../../../communication/race/DataInterfaces";
import { Answer } from "./Answer";

export class Question {
	private id: number;
	private answers: Answer[]; //Contains the possible answers including at least one right answer.
	private answerType: string;
	private schoolGradeId: number; //The school level this question is aimed for
	private difficulty: number; //The difficulty of this question depending on the level
	private questionRelativePath?: string;
	private feedbackRelativePath?: string;

	constructor(
		id: number,
		answers: Answer[],
		answerType: string,
		schoolGradeId: number,
		difficulty: number,
		questionFolderName?: string,
		feedbackFolderName?: string
	) {
		this.id = id;
		this.answers = answers;
		this.answerType = answerType;
		this.schoolGradeId = schoolGradeId;
		this.difficulty = difficulty;
		this.questionRelativePath = questionFolderName + "/1.png";
		this.feedbackRelativePath = feedbackFolderName + "/1.png";
	}

	public getId(): number {
		return this.id;
	}

	public IsAnswerRight(answerString: string): boolean {
		const correctAnswer = this.answers.find((answer) => answer.isRight());
		return correctAnswer.isEquivalentToAnswerString(answerString);
	}

	public getAnswerType(): string {
		return this.answerType;
	}

	public getQuestionRelativePath(): string {
		return this.questionRelativePath;
	}

	public getFeedbackRelativePath(): string {
		return this.feedbackRelativePath;
	}

	//returns true if there was a wrong question remaining and false if there was none
	public removeWrongAnswer(): boolean {
		const rightAnswer: Answer = this.answers.find((question) => question.isRight());
		const wrongAnswers: Answer[] = this.answers.filter((question) => !question.isRight());
		if (wrongAnswers.length === 0) {
			return false;
		} else {
			this.answers = wrongAnswers.splice(Math.floor(Math.random() * wrongAnswers.length), 1);
			this.answers.push(rightAnswer);
			return true;
		}
	}

	public getDTO(): QuestionDTO {
		return {
			id: this.id,
			answers: this.answers.map((answer) => answer.getDTO()),
			answerType: this.answerType,
			schoolGradeId: this.schoolGradeId,
			difficulty: this.difficulty,
			questionRelativePath: this.questionRelativePath,
			feedbackRelativePath: this.feedbackRelativePath,
		};
	}
}
