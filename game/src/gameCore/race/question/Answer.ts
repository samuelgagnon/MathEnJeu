import { AnswerDTO } from "../../../communication/race/DataInterfaces";

export class Answer {
	private label: string;
	private _isRight: boolean;
	constructor(label: string, isRight: boolean) {
		this.label = label;
		this._isRight = isRight;
	}

	public isRight(): boolean {
		return this._isRight;
	}

	public getLabel(): string {
		return this.label;
	}

	public isEquivalentToAnswerString(answerString: string): boolean {
		//TODO: update comparison to make it more flexible
		//(ex.: " BaNana" and "banana" should be equivalent)
		answerString = answerString.trim().toLowerCase();
		return answerString == this.label;
	}

	public getDTO(): AnswerDTO {
		return {
			label: this.label,
			isRight: this._isRight,
		};
	}
}
