import { Answer } from "./Answer";

export class Question {
	private answers: Answer[];
	private answerType: string;
	private questionRelativePath: string;
	private feedbackRelativePath: string;

	constructor(answers: Answer[], answerType: string, questionFolderName: string, feedbackFolderName: string) {
		this.answers = answers;
		this.answerType = answerType;
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
