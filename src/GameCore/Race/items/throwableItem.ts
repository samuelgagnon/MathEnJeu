import Player from "../playerFSM/player";
import Item from "./item";

export default abstract class ThrowableItem implements Item {
	isForAnsweringQuestion: boolean;
	readonly type: string;
	readonly storable: boolean;
	location: Point;
	abstract use(target: Player, from: Player): void;
	abstract onPickUp(player: Player): void;
}
