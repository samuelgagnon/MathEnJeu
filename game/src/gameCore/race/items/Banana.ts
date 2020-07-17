import Player from "../player/Player";
import Item, { ItemType } from "./Item";

export default class Banana implements Item {
	readonly type: ItemType = ItemType.Banana;
	readonly isForAnsweringQuestion: boolean = false;
	location: Point;

	//Position doesn't exist when on a player
	//Must specify position when in RaceGrid
	constructor(location?: Point) {
		this.location = location;
	}

	public onPickUp(player: Player): void {
		player.pickUpItem(this);
	}

	public use(target: Player, from: Player): void {
		target.bananaReceivedFrom(from);
	}
}
