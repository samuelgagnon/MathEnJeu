export default class Player {
	readonly socketId: string;
	name: string;
	points: number;
	position: Point;
	items: [];
	coins: number;
	constructor(socketId: string) {
		this.socketId = socketId;
	}

	public movePlayerTo(position: Point): void {
		this.position = position;
	}
}
