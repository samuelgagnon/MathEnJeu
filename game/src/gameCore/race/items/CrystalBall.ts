import Player from "../player/Player";
import Item, { ItemType } from "./Item";

export default class CrystalBall implements Item {
	readonly type: ItemType = ItemType.CrystalBall;
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
