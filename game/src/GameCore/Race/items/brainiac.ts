import Player from "../player/player";
import Item, { ItemType } from "./item";

export default class Brainiac implements Item {
	readonly type: ItemType = ItemType.Brainiac;
	readonly isForAnsweringQuestion: boolean = false;
	location: Point;

	constructor(location: Point) {
		this.location = location;
	}

	public onPickUp(player: Player): void {
		console.log("brainiac picked up");
		this.use(player);
	}

	public use(target: Player, from?: Player): void {
		target.activateBrainiac();
	}
}
