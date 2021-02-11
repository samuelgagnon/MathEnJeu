import { AnswerDTO } from "../../../communication/race/DataInterfaces";

export class Answer {
	private id: number;
	private label: string;
	private knownAsRight: boolean;
	constructor(id: number, label: string, isRight?: boolean) {
		this.id = id;
		this.label = label;
		//TODO: rethink implementation (maybe seperate client answers from server answers)
		if (isRight !== undefined && isRight != null) {
			this.knownAsRight = isRight;
		} else {
			this.knownAsRight = false;
		}
	}

	public getId(): number {
		return this.id;
	}

	public isKnownAsRight(): boolean {
		return this.knownAsRight;
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
			id: this.id,
			label: this.label,
		};
	}
}
