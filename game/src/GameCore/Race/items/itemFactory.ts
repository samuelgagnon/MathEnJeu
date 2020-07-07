import Banana from "./banana";
import Book from "./book";
import Brainiac from "./brainiac";
import CrystalBall from "./crystalBall";
import Item, { ItemType } from "./item";

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
}
