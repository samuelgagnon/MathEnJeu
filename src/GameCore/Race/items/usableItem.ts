import Player from "../playerFSM/player";
import Item from "./item";

export default abstract class UsableItem implements Item {
	isForAnsweringQuestion: boolean;
	type: string;
	storable: boolean;
	location: Point;
	abstract use(player: Player): void;
	abstract onPickUp(player: Player): void;
}
