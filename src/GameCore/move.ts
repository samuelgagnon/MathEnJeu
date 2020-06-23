export default class Move {
	startTimestamp: number;
	startLocation: Point;
	targetLocation: Point;
	speed: number;

	constructor(startTimestamp: number, startLocation: Point, targetLocation: Point) {
		this.startTimestamp = startTimestamp;
		this.startLocation = startLocation;
		this.targetLocation = targetLocation;
	}

	private getTotalTime(): number {
		return this.getTaxicabDistance() / this.speed;
	}

	private getTaxicabDistance(): number {
		return Math.abs(this.targetLocation.x - this.startLocation.x + (this.targetLocation.y - this.startLocation.y));
	}

	private getEuclidianDistance(): number {
		return Math.sqrt((this.targetLocation.x - this.startLocation.x) ** 2 + (this.targetLocation.y - this.startLocation.y) ** 2);
	}

	public getCurrentPosition(nowTimestamp: number = Date.now()): Point {
		let d: number = this.getTaxicabDistance();

		//t in [0,1] corresponds to the proportion of the move done.
		//t=0 means the move isn't started yet. I.e. the current position corresponds to startLocation.
		//t=1 means the move is over. I.e. the current position corresponds to targetLocation
		let t: number = (Date.now() - this.startTimestamp) / this.getTotalTime();
		t = t < 0 ? 0 : t;
		t = t > 1 ? 1 : t;

		//The current position c(t) is a R -> R^2 linear function for t in [0,1]
		let c: Point = {
			x: (1 - t) * this.startLocation.x + t * this.targetLocation.x,
			y: (1 - t) * this.startLocation.y + t * this.targetLocation.y,
		};

		return c;
	}
}
