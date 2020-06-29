import Player from "../playerFSM/player";
import Item from "./item";

export default class CrystalBall implements Item {
	readonly type: string = "Banana";
	readonly isForAnsweringQuestion: boolean = true;
	location: Point;

	constructor(location: Point) {
		this.location = location;
	}

	public onPickUp(player: Player): void {
		player.itemPickedUp(this);
	}

	public use(target: Player, from?: Player): void {
		target.useCrystalBall();
	}
}
