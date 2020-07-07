import Player from "../player/player";
import Item, { ItemType } from "./item";

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
