import { InventoryState } from "../../../communication/race/PlayerState";
import Item, { ItemType } from "../items/Item";
import ItemFactory from "../items/ItemFactory";

export default class Inventory {
	private bananaCount: number;
	private bookCount: number;
	private crystalBallCount: number;

	constructor(bananaCount: number = 0, bookCount: number = 0, crystalBall: number = 0) {
		this.bananaCount = bananaCount;
		this.bookCount = bookCount;
		this.crystalBallCount = crystalBall;
	}

	public updateInventoryFromState(inventoryState: InventoryState): void {
		this.bananaCount = inventoryState.bananaCount;
		this.bookCount = inventoryState.bookCount;
		this.crystalBallCount = inventoryState.crystalBallCount;
	}

	public getInventoryState(): InventoryState {
		return <InventoryState>{
			bananaCount: this.bananaCount,
			bookCount: this.bookCount,
			crystalBallCount: this.crystalBallCount,
		};
	}

	public addItem(item: Item): void {
		switch (item.type) {
			case ItemType.Banana:
				this.bananaCount += 1;
				break;
			case ItemType.Book:
				this.bookCount += 1;
				break;
			case ItemType.CrystalBall:
				this.crystalBallCount += 1;
				break;
		}
	}

	public getItem(itemType: ItemType): Item {
		let item: Item = undefined;
		switch (itemType) {
			case ItemType.Banana:
				if (this.bananaCount > 0) item = ItemFactory.create(ItemType.Banana);
				break;
			case ItemType.Book:
				if (this.bookCount > 0) item = ItemFactory.create(ItemType.Book);
				break;
			case ItemType.CrystalBall:
				if (this.crystalBallCount > 0) item = ItemFactory.create(ItemType.CrystalBall);
				break;
			default:
				throw new Error(`Item of type: ${itemType} doesn't exist`);
		}
		if (!item) throw new Error(`No more item of type: ${itemType} is left`);
		return item;
	}

	public removeItem(itemType: ItemType): void {
		switch (itemType) {
			case ItemType.Banana:
				this.bananaCount -= 1;
				break;
			case ItemType.Book:
				this.bookCount -= 1;
				break;
			case ItemType.CrystalBall:
				this.crystalBallCount -= 1;
				break;
		}
	}
}
