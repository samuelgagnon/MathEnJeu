import ItemState from "../../GameCore/Race/items/itemState";
import MoveState from "./moveState";

export default interface PlayerState {
	socketId: string;
	points: number;
	move: MoveState;
	items: ItemState[]; //A player doesn't need to know his enemies' items?
}
