import Tile from "./tile";

export default class RaceGrid {
	private tiles: Tile;
	private width: number;
	private height: number;

	constructor(tiles: Tile, width: number, height: number) {
		this.tiles = tiles;
		this.width = width;
		this.height = height;
	}
}
