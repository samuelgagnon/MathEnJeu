import ItemState from "../../Communication/Race/itemState";
import User from "../../server/data/user";
import ClientRaceGameController from "./ClientRaceGameController";
import Item, { ItemType } from "./items/item";
import ItemFactory from "./items/itemFactory";
import { startingInventory } from "./player/inventory";
import Player from "./player/player";
import StatusFactory from "./player/playerStatus/statusFactory";
import { StatusType } from "./player/playerStatus/statusType";
import RaceGrid from "./RaceGrid";
import { RACE_CST } from "./RACE_CST";
import ServerRaceGameController from "./ServerRaceGameController";
import Tile from "./tile";

export default class RaceGameFactory {
	public static createClient(
		gameTime: number,
		gameStartTimestamp: number,
		raceGrid: RaceGrid,
		players: Player[],
		currentPlayerId: string,
		playerSocket: SocketIOClient.Socket
	): ClientRaceGameController {
		return new ClientRaceGameController(gameTime, gameStartTimestamp, raceGrid, players, currentPlayerId, playerSocket);
	}

	public static createServer(users: User[]): ServerRaceGameController {
		const raceGrid = this.generateRaceGrid(RACE_CST.CIRCUIT.GRID_HEIGTH, RACE_CST.CIRCUIT.GRID_WIDTH);
		const players = this.generatePlayers(users);
		return new ServerRaceGameController(RACE_CST.CIRCUIT.GAME_MAX_LENGTH, raceGrid, players);
	}

	private static generateRaceGrid(gridWidth: number, gridHeight: number): RaceGrid {
		let tiles: Tile[];
		let itemsState: ItemState[];
		for (let y = 0; y < gridHeight; y++) {
			for (let x = 0; x < gridWidth; x++) {
				if (x == 0) {
					tiles.push(new Tile(true, true, false));
				} else if (x == gridWidth - 1) {
					tiles.push(new Tile(true, false, true));
				} else {
					if ((gridWidth * y + x) % 48 == 0) {
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
					}
				}
			}
		}

		return new RaceGrid(tiles, gridWidth, gridHeight, itemsState);
	}

	public static generatePlayers(users: User[]): Player[] {
		let players: Player[];
		users.forEach((user: User) => {
			players.push(new Player(user.userId, { x: 0, y: 0 }, user.name, StatusFactory.create(StatusType.NormalStatus), startingInventory));
		});

		return players;
	}
}
