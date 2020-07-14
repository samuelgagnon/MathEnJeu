import { StartingRaceGridInfo } from "../../Communication/Race/dataInterfaces";
import ItemState from "../../Communication/Race/itemState";
import User from "../../server/data/user";
import ClientRaceGameController from "./clientRaceGameController";
import Item, { ItemType } from "./items/item";
import ItemFactory from "./items/itemFactory";
import Inventory from "./player/inventory";
import Player from "./player/player";
import StatusFactory from "./player/playerStatus/statusFactory";
import { StatusType } from "./player/playerStatus/statusType";
import RaceGrid from "./raceGrid";
import { RACE_CST } from "./RACE_CST";
import ServerRaceGameController from "./serverRaceGameController";
import Tile from "./tile";

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
		const raceGrid = this.generateRaceGrid(RACE_CST.CIRCUIT.GRID_HEIGTH, RACE_CST.CIRCUIT.GRID_WIDTH);
		const players = this.generatePlayers(users);
		return new ServerRaceGameController(RACE_CST.CIRCUIT.GAME_MAX_LENGTH, raceGrid, players, users, gameId);
	}

	private static generateRaceGrid(gridWidth: number, gridHeight: number): RaceGrid {
		let tiles: Tile[] = [];
		let itemsState: ItemState[] = [];
		for (let y = 0; y < gridHeight; y++) {
			for (let x = 0; x < gridWidth; x++) {
				if (x == 0) {
					tiles.push(new Tile(true, true, false));
				} else if (x == gridWidth - 1) {
					tiles.push(new Tile(true, false, true));
				} else {
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

						const item: Item = ItemFactory.create(itemType, <Point>{ x, y });
						const itemState: ItemState = { type: itemType, location: <Point>{ x, y } };
						tiles.push(new Tile(true, false, false, item));
						itemsState.push(itemState);
					} else {
						tiles.push(new Tile(true, false, false));
					}
				}
			}
		}

		return new RaceGrid(tiles, gridWidth, gridHeight, itemsState);
	}

	public static generatePlayers(users: User[]): Player[] {
		let players: Player[] = [];
		users.forEach((user: User) => {
			players.push(new Player(user.userId, { x: 0, y: 0 }, user.name, StatusFactory.create(StatusType.NormalStatus), new Inventory()));
		});

		return players;
	}

	public static generateClientRaceGrid(startingRaceGridInfo: StartingRaceGridInfo): RaceGrid {
		let tiles: Tile[] = [];
		for (let y = 0; y < startingRaceGridInfo.height; y++) {
			for (let x = 0; x < startingRaceGridInfo.width; x++) {
				if (startingRaceGridInfo.startingPositions.find((position: Point) => position.x == x && position.y == y)) {
					tiles.push(new Tile(true, true, false));
				} else if (startingRaceGridInfo.finishLinePositions.find((position: Point) => position.x == x && position.y == y)) {
					tiles.push(new Tile(true, false, true));
				} else {
					tiles.push(new Tile(true, false, false));
				}
			}
		}

		startingRaceGridInfo.itemStates.forEach((itemState: ItemState) => {
			tiles[startingRaceGridInfo.width * itemState.location.y + itemState.location.x].setItem(ItemFactory.create(itemState.type, itemState.location));
		});

		return new RaceGrid(tiles, startingRaceGridInfo.width, startingRaceGridInfo.height, startingRaceGridInfo.itemStates);
	}
}
