import Player from "../player";
import Item from "./item";

export default class Book implements Item {
	name: string;
	location: Point;

	constructor(location: Point) {
		this.location = location;
	}

	public use(player: Player): void {}
}
