import Player from "../player";

export default interface Item {
	name: string;
	location: Point;
	use(player: Player): void;
}
