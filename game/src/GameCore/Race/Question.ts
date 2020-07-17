import Answer from "./Answer";

export class Question {
	answers: Answer[];
	constructor() {}

	IsAnswerRight(answerString: string) {
		this.answers.forEach((answer) => {
			if (answer.isEquivalentToAnswerString(answerString)) {
				return true;
			}
		});
		return false;
	}
}
