import { InventoryState } from "../../../Communication/Race/playerState";
import Item from "../items/item";
import Inventory from "./inventory";

export default class InventoryArray implements Inventory {
	private bananaCount: number;
	private bookCount: number;
	private crystalBallCount: number;
	private items: Item[];

	constructor(bananaCount: number, bookCount: number, crystalBall: number) {
		this.bananaCount = bananaCount;
		this.bookCount = bookCount;
		this.crystalBallCount = crystalBall;
	}

	public updateInventoryFromState(inventoryState: InventoryState): void {
		if (inventoryState != this.getInventoryState()) {
			const bananaCount = inventoryState.bananaCount;
			const bookCount = inventoryState.bookCount;
			const crystalBall = inventoryState.crystalBallCount;

			this.items = [];

			// for (let i = 0; i < ; i++) {

			// }
		}
	}

	public getInventoryState(): InventoryState {
		return <InventoryState>{
			bananaCount: this.bananaCount,
			bookCount: this.bookCount,
			crystalBallCount: this.crystalBallCount,
		};
	}

	public addItem(item: Item): void {
		this.items.push(item);
	}

	public getItem(itemType: string): Item {
		const itemUsedIndex = this.items.findIndex((item) => item.type == itemType);
		return this.items[itemUsedIndex];
	}

	public removeItem(itemType: string): void {
		const itemUsedIndex = this.items.findIndex((item) => item.type == itemType);
		this.items.splice(itemUsedIndex, 1);
	}
}

export const startingInventory: InventoryArray = new InventoryArray(0, 0, 0);
