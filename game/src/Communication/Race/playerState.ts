import ItemState from "./itemState";
import MoveState from "./moveState";

export default interface PlayerState {
	id: string;
	points: number;
	move: MoveState;
	items: ItemState[]; //A player doesn't need to know his enemies' items?
}
