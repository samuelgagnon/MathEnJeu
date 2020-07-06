import Player from "../player/player";
import Item from "./item";

export default class CrystalBall implements Item {
	readonly type: string = "CrystalBall";
	readonly isForAnsweringQuestion: boolean = true;
	location: Point;

	constructor(location?: Point) {
		this.location = location;
	}

	public onPickUp(player: Player): void {
		player.pickUpItem(this);
	}

	public use(target: Player, from?: Player): void {
		target.useCrystalBall();
	}
}
