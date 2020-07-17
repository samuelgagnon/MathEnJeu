import Player from "../player/Player";
import Item, { ItemType } from "./Item";

export default class Book implements Item {
	readonly type: ItemType = ItemType.Book;
	readonly isForAnsweringQuestion: boolean = true;
	location: Point;

	constructor(location?: Point) {
		this.location = location;
	}

	public onPickUp(player: Player): void {
		player.pickUpItem(this);
	}

	public use(target: Player, from?: Player): void {
		target.useBook();
	}
}
