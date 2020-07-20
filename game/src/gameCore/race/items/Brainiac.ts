import Player from "../player/Player";
import Item, { ItemType } from "./Item";

export default class Brainiac implements Item {
	readonly type: ItemType = ItemType.Brainiac;
	readonly isForAnsweringQuestion: boolean = false;
	location: Point;

	constructor(location: Point) {
		this.location = location;
	}

	public onPickUp(player: Player): void {
		this.use(player);
	}

	public use(target: Player, from?: Player): void {
		target.activateBrainiac();
	}
}
