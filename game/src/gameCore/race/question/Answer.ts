import { AnswerDTO } from "../../../communication/race/AnswerDTO";

export class Answer {
	private id: number;
	private label: string;
	private isRight: boolean;
	constructor(id: number, label: string, isRight?: boolean) {
		this.id = id;
		this.label = label;
		//TODO: rethink implementation (maybe seperate client answers from server answers)
		if (isRight !== undefined && isRight != null) {
			this.isRight = isRight;
		} else {
			this.isRight = false;
		}
	}

	public getId(): number {
		return this.id;
	}

	public getIsRight(): boolean {
		return this.isRight;
	}

	public getLabel(): string {
		return this.label;
	}

	public isEquivalentToAnswerString(answerString: string): boolean {
		//TODO: update comparison to make it more flexible
		//(ex.: " BaNana" and "banana" should be equivalent)
		answerString = answerString.trim().toLowerCase();
		return answerString == this.label.toLowerCase();
	}

	public getDTO(): AnswerDTO {
		return {
			id: this.id,
			label: this.label,
			isRight: this.getIsRight(),
		};
	}
}
