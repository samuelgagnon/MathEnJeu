import Player from "../playerFSM/player";
import Item from "./item";

export default class Brainiac implements Item {
	readonly type: string = "Brainiac";
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
