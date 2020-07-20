import { ItemType } from "../../gameCore/race/items/Item";

export default interface ItemState {
	type: ItemType;
	location: Point;
}
