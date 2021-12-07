import Player from "../player/Player";

export default interface Item {
	readonly type: ItemType;
	readonly isForAnsweringQuestion: boolean;
	location: Point;
	onPickUp(player: Player): void;
	use(target: Player, from?: Player): void;
}

export enum ItemType {
	Banana = "Cloud",
	Brainiac = "Battery",
	Book = "USB Drive",
	CrystalBall = "Light bulb",
	// Banana = "Banana",
	// Brainiac = "Brainiac",
	// Book = "Book",
	// CrystalBall = "CrystalBall",
}
