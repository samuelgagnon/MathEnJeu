import { Answer } from "./Answer";

export class Question {
	private answers: Answer[]; //Contains the possible answers including at least one right answer.
	private answerType: string;
	private levelId: number; //The school level this question is aimed for
	private difficulty: number; //The difficulty of this question depending on the level
	private questionRelativePath: string;
	private feedbackRelativePath: string;

	constructor(answers: Answer[], answerType: string, levelId: number, difficulty: number, questionFolderName: string, feedbackFolderName: string) {
		this.answers = answers;
		this.answerType = answerType;
		this.levelId = levelId;
		this.difficulty = difficulty;
		this.questionRelativePath = questionFolderName + "/1.png";
		this.feedbackRelativePath = feedbackFolderName + "/1.png";
	}

	public IsAnswerRight(answerString: string) {
		this.answers.forEach((answer) => {
			if (answer.isEquivalentToAnswerString(answerString)) {
				return true;
			}
		});
		return false;
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
}
