import Banana from "./Banana";
import Book from "./Book";
import Brainiac from "./Brainiac";
import CrystalBall from "./CrystalBall";
import Item, { ItemType } from "./Item";

export default class ItemFactory {
	public static create(itemType: ItemType, location?: Point): Item {
		switch (itemType) {
			case ItemType.Banana:
				return new Banana(location);

			case ItemType.Brainiac:
				return new Brainiac(location);

			case ItemType.Book:
				return new Book(location);

			case ItemType.CrystalBall:
				return new CrystalBall(location);

			default:
				break;
		}
	}

	public static generateItemType(): ItemType {
		const rng = Math.floor(Math.random() * 4) + 1;
		let itemType: ItemType;
		switch (rng) {
			case 1:
				itemType = ItemType.Banana;
				break;
			case 2:
				itemType = ItemType.Book;
				break;
			case 3:
				itemType = ItemType.Brainiac;
				break;
			case 4:
				itemType = ItemType.CrystalBall;
				break;
		}
		return itemType;
	}
}
