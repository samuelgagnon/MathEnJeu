import Item from "./items/item";
import Player from "./player/player";

export default class Tile {
	private item?: Item;
	readonly isWakable: boolean;

	constructor(item: Item, isWakable: boolean) {
		this.item = item;
		this.isWakable = isWakable;
	}

	//control flow by controller ?
	public pickUpItem(): Item {
		const item = this.item;
		this.item = null;
		return item;
	}

	//control flow by the tile itself ?
	public playerPickUpItem(player: Player): void {
		player.pickUpItem(this.item);
	}
}
