import { AnswerDTO } from "../../../communication/race/DataInterfaces";

export class Answer {
	private id: number;
	private label: string;
	private _isRight: boolean;
	constructor(id: number, label: string, isRight?: boolean) {
		this.id = id;
		this.label = label;
		this._isRight = isRight;
	}

	public getId(): number {
		return this.id;
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
		const isright = this._isRight ? 1 : 0;
		return {
			id: this.id,
			label: this.label,
		};
	}
}
