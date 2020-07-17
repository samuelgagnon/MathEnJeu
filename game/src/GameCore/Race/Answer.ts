export default class Answer {
	private label: string;
	private right: boolean;
	constructor() {}
	isRight(): boolean {
		return this.right;
	}
	isEquivalentToAnswerString(answerString: string): boolean {
		//TODO: update comparison to make it more flexible
		//(ex.: " BaNana" and "banana" should be equivalent)
		return answerString == this.label;
	}
}
