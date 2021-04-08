import { ItemType } from "../../gameCore/race/items/Item";

//State used to locate item on the board
export default interface ItemState {
	type: ItemType;
	location: Point;
}
