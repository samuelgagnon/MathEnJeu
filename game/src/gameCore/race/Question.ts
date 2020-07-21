import { Answer } from "./Answer";

export class Question {
	private answers: Answer[];
	private imageRelativePath: string;

	constructor(answers: Answer[], imageFolderName: string) {
		this.answers = answers;
		this.imageRelativePath = imageFolderName + "/1.png";
	}

	public IsAnswerRight(answerString: string) {
		this.answers.forEach((answer) => {
			if (answer.isEquivalentToAnswerString(answerString)) {
				return true;
			}
		});
		return false;
	}

	public getQuestionRelativePath(): string {
		return this.imageRelativePath;
	}
}
