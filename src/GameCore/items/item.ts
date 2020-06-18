import ItemState from "./itemState";

export default abstract class Item implements ItemState {
	name: string;
	location: Point;
	use(): void {}
}
