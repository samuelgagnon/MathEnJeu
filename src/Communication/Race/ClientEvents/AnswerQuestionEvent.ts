import SocketEvent from "../../SocketEvent";

export default class AnswerQuestionEvent implements SocketEvent {
	private static readonly _Name: string = "AnswerQuestionEvent";
	private _data: { timestamp: number; answer: string };

	constructor(timestamp: number, answer: string) {}

	get Name(): string {
		return (this.constructor as typeof AnswerQuestionEvent)._Name;
	}

	get data(): { timestamp: number; answer: string } {
		return this._data;
	}

	get timestamp(): number {
		return this._data.timestamp;
	}
	set timestamp(timestamp: number) {
		this._data.timestamp = timestamp;
	}

	get targetPoint(): string {
		return this._data.answer;
	}
	set targetPoint(answer: string) {
		this._data.answer = answer;
	}
}
