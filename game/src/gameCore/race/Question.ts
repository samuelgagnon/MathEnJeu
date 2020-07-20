import { Answer } from "./Answer";

export class Question {
	answers: Answer[];
	imageRelativePath: string;
	constructor(answers: Answer[], imageFolderName: string) {
		this.answers = answers;
		this.imageRelativePath = imageFolderName + "/1.png";
	}

	IsAnswerRight(answerString: string) {
		this.answers.forEach((answer) => {
			if (answer.isEquivalentToAnswerString(answerString)) {
				return true;
			}
		});
		return false;
	}
}
