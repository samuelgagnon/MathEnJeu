import { StartingRaceGridInfo } from "../../communication/race/DataInterfaces";
import ItemState from "../../communication/race/ItemState";
import User from "../../server/data/User";
import ClientRaceGameController from "./ClientRaceGameController";
import RaceGrid from "./grid/RaceGrid";
import Tile from "./grid/Tile";
import Item, { ItemType } from "./items/Item";
import ItemFactory from "./items/ItemFactory";
import Inventory from "./player/Inventory";
import Player from "./player/Player";
import StatusFactory from "./player/playerStatus/StatusFactory";
import { StatusType } from "./player/playerStatus/StatusType";
import { RACE_CST } from "./RACE_CST";
import ServerRaceGameController from "./ServerRaceGameController";

export default class RaceGameFactory {
	public static createClient(
		gameTime: number,
		gameStartTimestamp: number,
		startingRaceGridInfo: StartingRaceGridInfo,
		players: Player[],
		currentPlayerId: string,
		playerSocket: SocketIOClient.Socket
	): ClientRaceGameController {
		const raceGrid = this.generateClientRaceGrid(startingRaceGridInfo);
		console.log("client created");
		return new ClientRaceGameController(gameTime, gameStartTimestamp, raceGrid, players, currentPlayerId, playerSocket);
	}

	public static createServer(gameId: string, users: User[]): ServerRaceGameController {
		const raceGrid = this.generateRaceGrid(RACE_CST.CIRCUIT.GRID_WIDTH, RACE_CST.CIRCUIT.GRID_HEIGTH, RACE_CST.CIRCUIT.GRID);
		const players = this.generatePlayers(users, raceGrid.getStartingPositions());
		return new ServerRaceGameController(RACE_CST.CIRCUIT.GAME_MAX_LENGTH, raceGrid, players, users, gameId);
	}

	//grid is a string with exactly (gridWidth x gridHeight) number of characters.
	private static generateRaceGrid(gridWidth: number, gridHeight: number, grid: string): RaceGrid {
		let tiles: Tile[] = [];
		let itemsState: ItemState[] = [];
		for (let y = 0; y < gridHeight; y++) {
			for (let x = 0; x < gridWidth; x++) {
				const tileSymbol = grid.charAt(gridWidth * y + x);

				//Tile is Non walkable
				if (tileSymbol === "x") {
					tiles.push(new Tile(false, false, false));

					//Tile is Startposition & Finishline
				} else if (tileSymbol === "|") {
					tiles.push(new Tile(true, true, true));
				} else {
					let item: Item = undefined;
					if ((gridWidth * y + x) % 4 == 0) {
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

						const itemState: ItemState = { type: itemType, location: <Point>{ x, y } };
						itemsState.push(itemState);

						item = ItemFactory.create(itemType, <Point>{ x, y });
					}

					//Tile is Walkable
					if (tileSymbol == ".") {
						tiles.push(new Tile(true, false, false, item));

						//Tile is Checkpoint
					} else {
						let checkpointGroup = Number(tileSymbol);
						if (checkpointGroup == NaN) {
							throw Error("Error in race grid generation: Tile symbol '" + tileSymbol + "' is not recognized");
						} else {
							if (checkpointGroup >= 1 && checkpointGroup <= RACE_CST.CIRCUIT.NUMBER_OF_CHECKPOINTS) {
								tiles.push(new Tile(true, false, false, item, Number(tileSymbol)));
							} else {
								throw Error("Error in race grid generation: Checkpoint group '" + tileSymbol + "' is not in the range.");
							}
						}
					}
				}
			}
		}

		return new RaceGrid(tiles, gridWidth, gridHeight, itemsState);
	}

	public static generatePlayers(users: User[], startingPositions: Point[]): Player[] {
		let players: Player[] = [];
		let i: number = 0;
		users.forEach((user: User) => {
			players.push(new Player(user.userId, startingPositions[i], user.userInfo.name, StatusFactory.create(StatusType.NormalStatus), new Inventory()));
			i++;
		});

		return players;
	}

	public static generateClientRaceGrid(startingRaceGridInfo: StartingRaceGridInfo): RaceGrid {
		let tiles: Tile[] = [];
		for (let y = 0; y < startingRaceGridInfo.height; y++) {
			for (let x = 0; x < startingRaceGridInfo.width; x++) {
				const isWalkable: boolean =
					startingRaceGridInfo.nonWalkablePositions.find((position: Point) => position.x == x && position.y == y) === undefined;
				const isStartPosition: boolean =
					startingRaceGridInfo.startingPositions.find((position: Point) => position.x == x && position.y == y) !== undefined;
				const isFinishLine: boolean =
					startingRaceGridInfo.finishLinePositions.find((position: Point) => position.x == x && position.y == y) !== undefined;
				tiles.push(new Tile(isWalkable, isStartPosition, isFinishLine));
			}
		}

		startingRaceGridInfo.itemStates.forEach((itemState: ItemState) => {
			tiles[startingRaceGridInfo.width * itemState.location.y + itemState.location.x].setItem(ItemFactory.create(itemState.type, itemState.location));
		});

		return new RaceGrid(tiles, startingRaceGridInfo.width, startingRaceGridInfo.height, startingRaceGridInfo.itemStates);
	}
}
