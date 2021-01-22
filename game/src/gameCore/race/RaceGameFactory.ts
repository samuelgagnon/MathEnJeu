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
import PlayerFactory from "./player/PlayerFactory";
import StatusFactory from "./player/playerStatus/StatusFactory";
import { StatusType } from "./player/playerStatus/StatusType";
import { RACE_CST } from "./RACE_CST";

//RaceGameController was split in 2 to prevent unused dependencies to be sent to the client
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
		return new ClientRaceGameController(gameTime, gameStartTimestamp, raceGrid, players, currentPlayerId, playerSocket);
	}

	//grid is a string with exactly (gridWidth x gridHeight) number of characters.
	public static generateRaceGrid(gridWidth: number, gridHeight: number, grid: string, isSinglePlayer: boolean): RaceGrid {
		let tiles: Tile[] = [];
		let itemsState: ItemState[] = [];
		for (let y = 0; y < gridHeight; y++) {
			for (let x = 0; x < gridWidth; x++) {
				const tileSymbol = grid.charAt(gridWidth * y + x);

				//Tile is Non walkable
				if (tileSymbol === "x") {
					tiles.push(new Tile(<Point>{ x, y }, false, false, false));

					//Tile is Startposition & Finishline
				} else if (tileSymbol === "|") {
					tiles.push(new Tile(<Point>{ x, y }, true, true, true));
				} else {
					let item: Item = undefined;
					if ((gridWidth * y + x) % 4 == 0) {
						let itemType: ItemType = ItemFactory.generateItemType(isSinglePlayer);
						const itemState: ItemState = { type: itemType, location: <Point>{ x, y } };
						itemsState.push(itemState);

						item = ItemFactory.create(itemType, <Point>{ x, y });
					}

					//Tile is Walkable
					if (tileSymbol == ".") {
						tiles.push(new Tile(<Point>{ x, y }, true, false, false, item));

						//Tile is Checkpoint
					} else {
						let checkpointGroup = Number(tileSymbol);
						if (checkpointGroup == NaN) {
							throw Error("Error in race grid generation: Tile symbol '" + tileSymbol + "' is not recognized");
						} else {
							if (checkpointGroup >= 1 && checkpointGroup <= RACE_CST.CIRCUIT.NUMBER_OF_CHECKPOINTS) {
								tiles.push(new Tile(<Point>{ x, y }, true, false, false, item, Number(tileSymbol)));
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
			let currentIndex = i;
			if (i >= startingPositions.length) {
				currentIndex = i % startingPositions.length;
			}
			players.push(PlayerFactory.create(user, startingPositions[currentIndex], StatusFactory.create(StatusType.NormalStatus), new Inventory()));
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
				tiles.push(new Tile(<Point>{ x, y }, isWalkable, isStartPosition, isFinishLine));
			}
		}

		startingRaceGridInfo.itemStates.forEach((itemState: ItemState) => {
			tiles[startingRaceGridInfo.width * itemState.location.y + itemState.location.x].setItem(ItemFactory.create(itemState.type, itemState.location));
		});

		return new RaceGrid(tiles, startingRaceGridInfo.width, startingRaceGridInfo.height, startingRaceGridInfo.itemStates);
	}
}
