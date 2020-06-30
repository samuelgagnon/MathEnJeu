import Player from "../player/player";

export default interface Item {
	readonly type: string;
	readonly isForAnsweringQuestion: boolean;
	location: Point;
	onPickUp(player: Player): void;
	use(target: Player, from?: Player): void;
}
