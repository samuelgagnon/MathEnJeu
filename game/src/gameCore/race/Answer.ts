export class Answer {
	private label: string;
	private _isRight: boolean;
	constructor(label: string, isRight: boolean) {
		this.label = label;
		this._isRight = isRight;
	}
	isRight(): boolean {
		return this._isRight;
	}
	isEquivalentToAnswerString(answerString: string): boolean {
		//TODO: update comparison to make it more flexible
		//(ex.: " BaNana" and "banana" should be equivalent)
		return answerString == this.label;
	}
}
