import { InventoryState } from "../../../Communication/Race/playerState";
import Item from "../items/item";

export default interface Inventory {
	updateInventoryFromState(inventoryState: InventoryState): void;
	getInventoryState(): InventoryState;
	addItem(item: Item): void;
	getItem(itemType: string): Item;
	removeItem(itemType: string): void;
}
