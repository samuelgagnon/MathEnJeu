import ItemState from "../../communication/race/ItemState";
import PlayerState from "../../communication/race/PlayerState";
import { StartingRaceGridInfo } from "../../communication/race/StartingGridInfo";
import User from "../../server/rooms/User";
import ClientRaceGameController from "./ClientRaceGameController";
import RaceGrid from "./grid/RaceGrid";
import Tile from "./grid/Tile";
import ItemFactory from "./items/ItemFactory";
import ComputerPlayer from "./player/ComputerPlayer/ComputerPlayer";
import PathFinder from "./player/ComputerPlayer/PathFinder";
import HumanPlayer from "./player/HumanPlayer";
import Inventory from "./player/Inventory";
import PlayerFactory from "./player/PlayerFactory";
import PlayerInMemoryRepository from "./player/playerRepository/PlayerInMemoryRepository";
import { PlayerRepository, TargetablePlayers } from "./player/playerRepository/PlayerRepository";
import StatusFactory from "./player/playerStatus/StatusFactory";
import { StatusType } from "./player/playerStatus/StatusType";
import { RACE_PARAMETERS } from "./RACE_PARAMETERS";

//RaceGameController was split in 2 to prevent unused dependencies to be sent to the client
export default class RaceGameFactory {
	public static createClient(
		gameTime: number,
		gameStartTimestamp: number,
		startingRaceGridInfo: StartingRaceGridInfo,
		playerRepo: PlayerRepository,
		currentPlayerId: string,
		playerSocket: SocketIOClient.Socket
	): ClientRaceGameController {
		const raceGrid = this.generateClientRaceGrid(startingRaceGridInfo);
		return new ClientRaceGameController(gameTime, gameStartTimestamp, raceGrid, playerRepo, currentPlayerId, playerSocket);
	}

	//grid is a string with exactly (gridWidth x gridHeight) number of characters.
	public static generateRaceGrid(gridWidth: number, gridHeight: number, grid: string, isSinglePlayer: boolean, itemCount: number): RaceGrid {
		let tiles: Tile[] = [];
		for (let y = 0; y < gridHeight; y++) {
			for (let x = 0; x < gridWidth; x++) {
				const tileSymbol = grid.charAt(gridWidth * y + x);

				//Tile is Non walkable
				if (tileSymbol === "x") {
					tiles.push(new Tile(<Point>{ x, y }, false, false, false, false));

					//Tile is Startposition & Finishline
				} else if (tileSymbol === "|") {
					tiles.push(new Tile(<Point>{ x, y }, true, true, true, false));
				} else {
					//Tile is Walkable
					if (tileSymbol == ".") {
						tiles.push(new Tile(<Point>{ x, y }, true, false, false, false));

						//Tile is Checkpoint
					} else if (tileSymbol === "w") {
						tiles.push(new Tile(<Point>{ x, y }, false, false, false, true));
					} else {
						let checkpointGroup = Number(tileSymbol);
						if (checkpointGroup == NaN) {
							throw Error("Error in race grid generation: Tile symbol '" + tileSymbol + "' is not recognized");
						} else {
							if (checkpointGroup >= 1 && checkpointGroup < RACE_PARAMETERS.CIRCUIT.NUMBER_OF_CHECKPOINTS) {
								tiles.push(new Tile(<Point>{ x, y }, true, false, false, false, undefined, Number(tileSymbol)));
							} else if (checkpointGroup == RACE_PARAMETERS.CIRCUIT.NUMBER_OF_CHECKPOINTS) {
								tiles.push(new Tile(<Point>{ x, y }, true, false, true, false, undefined, Number(tileSymbol)));
							} else {
								throw Error("Error in race grid generation: Checkpoint group '" + tileSymbol + "' is not in the range.");
							}
						}
					}
				}
			}
		}
		let raceGrid = new RaceGrid(tiles, gridWidth, gridHeight, [], RACE_PARAMETERS.CIRCUIT.NUMBER_OF_CHECKPOINTS);
		for (let i = 0; i < itemCount; i++) {
			raceGrid.generateNewItem([], isSinglePlayer);
		}
		return raceGrid;
	}

	public static generateHumanPlayers(users: User[], startingPositions: Point[]): HumanPlayer[] {
		let players: HumanPlayer[] = [];
		users.forEach((user: User, index: number) => {
			let currentIndex = index;
			if (index >= startingPositions.length) {
				currentIndex = index % startingPositions.length;
			}
			players.push(
				PlayerFactory.createHumanPlayer(user, startingPositions[currentIndex], StatusFactory.create(StatusType.NormalStatus), new Inventory())
			);
		});
		return players;
	}

	public static generateComputerPlayers(
		numberOfBots: number,
		startingPositions: Point[],
		gameStartTimeStamp: number,
		raceGrid: RaceGrid,
		playerRepository: TargetablePlayers
	): ComputerPlayer[] {
		let computerPlayers: ComputerPlayer[] = [];
		for (let index = 0; index < numberOfBots; index++) {
			let currentIndex = index;
			if (index >= startingPositions.length) {
				currentIndex = index % startingPositions.length;
			}
			const pathFinder = new PathFinder(raceGrid);
			const botName = `bot-${index}`;
			computerPlayers.push(
				PlayerFactory.createComputerPlayer(
					botName,
					botName,
					startingPositions[currentIndex],
					StatusFactory.create(StatusType.NormalStatus),
					new Inventory(),
					gameStartTimeStamp,
					pathFinder,
					raceGrid.getCheckpointPositions(),
					playerRepository
				)
			);
		}
		return computerPlayers;
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
				tiles.push(new Tile(<Point>{ x, y }, isWalkable, isStartPosition, isFinishLine, false));
			}
		}

		startingRaceGridInfo.itemStates.forEach((itemState: ItemState) => {
			tiles[startingRaceGridInfo.width * itemState.location.y + itemState.location.x].setItem(ItemFactory.create(itemState.type, itemState.location));
		});

		return new RaceGrid(
			tiles,
			startingRaceGridInfo.width,
			startingRaceGridInfo.height,
			startingRaceGridInfo.itemStates,
			RACE_PARAMETERS.CIRCUIT.NUMBER_OF_CHECKPOINTS
		);
	}

	public static createClientPlayers(playersState: PlayerState[]): PlayerRepository {
		let playerRepo: PlayerRepository = new PlayerInMemoryRepository();
		playersState.forEach((playerState: PlayerState) => {
			playerRepo.addPlayer(PlayerFactory.createFromPlayerState(playerState));
		});
		return playerRepo;
	}
}
