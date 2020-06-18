import SocketEvent from "../../SocketEvent";

export default class MoveCharacterEvent implements SocketEvent {
	private static readonly _Name: string = "MoveCharacterEvent";
	private _data: { targetPoint: Point };

	constructor(timestamp: number, targetPoint: Point) {}

	get Name(): string {
		return (this.constructor as typeof MoveCharacterEvent)._Name;
	}

	get data(): { targetPoint: Point } {
		return this._data;
	}

	get targetPoint(): Point {
		return this._data.targetPoint;
	}
	set targetPoint(targetPoint: Point) {
		this._data.targetPoint = targetPoint;
	}
}
