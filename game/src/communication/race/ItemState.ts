import { ItemType } from "../../GameCore/Race/items/item";

export default interface ItemState {
	type: ItemType;
	location: Point;
}
