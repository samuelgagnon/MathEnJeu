import { InventoryState } from "../../../Communication/Race/playerState";
import Banana from "../items/banana";
import Book from "../items/book";
import CrystalBall from "../items/crystalBall";
import Item from "../items/item";
import Inventory from "./inventory";

export default class InventoryObject implements Inventory {
	private bananaCount: number;
	private bookCount: number;
	private crystalBallCount: number;

	constructor(bananaCount: number, bookCount: number, crystalBall: number) {
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
			case "Banana":
				this.bananaCount += 1;
				break;
			case "Book":
				this.bookCount += 1;
				break;
			case "CrystalBall":
				this.crystalBallCount += 1;
				break;
			default:
				break;
		}
	}

	public getItem(itemType: string): Item {
		switch (itemType) {
			case "Banana":
				if (this.bananaCount > 0) return new Banana();
			case "Book":
				if (this.bookCount > 0) return new Book();
			case "CrystalBall":
				if (this.crystalBallCount > 0) return new CrystalBall();
			default:
				return undefined;
		}
	}

	public removeItem(itemType: string): void {
		switch (itemType) {
			case "Banana":
				this.bananaCount -= 1;
				break;
			case "Book":
				this.bookCount -= 1;
				break;
			case "CrystalBall":
				this.crystalBallCount -= 1;
				break;
			default:
				break;
		}
	}
}
