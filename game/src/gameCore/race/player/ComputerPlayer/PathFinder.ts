import { AStarFinder } from "astar-typescript";
import RaceGrid from "../../grid/RaceGrid";

/**
 * This class is used to seperate the path finding algorithm used for computer players from the ComputerPlayer class or any other class using it.
 * The implementation currently uses a 3rd party library (AStartFinder) that uses an AStar algorithm.
 */
export default class PathFinder {
	private aStarInstance: AStarFinder;

	constructor(grid: RaceGrid) {
		this.aStarInstance = this.createAStarInstance(grid);
	}

	public findPath(startPoint: Point, endPoint: Point): Point[] {
		let path = this.aStarInstance.findPath({ x: startPoint.x, y: startPoint.y }, { x: endPoint.x, y: endPoint.y });
		return path.map((point) => <Point>{ x: point[0], y: point[1] });
	}

	private createAStarInstance(grid: RaceGrid): AStarFinder {
		let matrix: number[][] = [];
		for (let y = 0; y < grid.getHeight(); y++) {
			let row: number[] = [];
			for (let x = 0; x < grid.getWidth(); x++) {
				const tile = grid.getTile(<Point>{ x, y });
				const walkableValue = tile.isWalkable ? 0 : 1;
				row.push(walkableValue);
			}
			matrix.push(row);
		}

		return new AStarFinder({
			grid: {
				matrix: matrix,
			},
			diagonalAllowed: false,
		});
	}
}
