import { InventoryState } from "../../../Communication/Race/playerState";
import Item, { ItemType } from "../items/item";

export default interface Inventory {
	updateInventoryFromState(inventoryState: InventoryState): void;
	getInventoryState(): InventoryState;
	addItem(item: Item): void;
	getItem(itemType: ItemType): Item;
	removeItem(itemType: ItemType): void;
}
