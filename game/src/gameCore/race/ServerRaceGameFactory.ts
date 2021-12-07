import { GameOptions } from "../../communication/room/EventInterfaces";
import { serviceConstants } from "../../server/context/CommonContext";
import ServiceLocator from "../../server/context/ServiceLocator";
import User from "../../server/rooms/User";
import { Clock } from "../clock/Clock";
import PlayerInMemoryRepository from "./player/playerRepository/PlayerInMemoryRepository";
import RaceGameFactory from "./RaceGameFactory";
import { RACE_PARAMETERS_10, RACE_PARAMETERS_20, RACE_PARAMETERS_30, RACE_PARAMETERS as DEFAULT_RACE_PARAMETERS } from "./RACE_PARAMETERS";
import ServerRaceGameController from "./ServerRaceGameController";

//RaceGameController was split in 2 to prevent unused dependencies to be sent to the client
export default class ServerRaceGameFactory {
	public static createServer(gameId: string, users: User[], gameOptions: GameOptions): ServerRaceGameController {
		let RACE_PARAMETERS = RACE_PARAMETERS_10;
		if (gameOptions.gameTime > 10 && gameOptions.gameTime <= 20) {
			RACE_PARAMETERS = RACE_PARAMETERS_20;
		} else if (gameOptions.gameTime > 20) {
			RACE_PARAMETERS = RACE_PARAMETERS_30;
		}
		const gameStartTimeStamp = Clock.now() + DEFAULT_RACE_PARAMETERS.CIRCUIT.STARTING_TRANSITION_DURATION;
		const isSinglePlayer = users.length == 1;
		const raceGrid = RaceGameFactory.generateRaceGrid(
			RACE_PARAMETERS.CIRCUIT.GRID_WIDTH,
			RACE_PARAMETERS.CIRCUIT.GRID_HEIGTH,
			RACE_PARAMETERS.CIRCUIT.GRID,
			isSinglePlayer,
			RACE_PARAMETERS.CIRCUIT.NUMBER_OF_ITEMS
		);
		let playerRepository = new PlayerInMemoryRepository();
		const humanPlayers = RaceGameFactory.generateHumanPlayers(users, raceGrid.getStartingPositions());
		const computerPlayers = RaceGameFactory.generateComputerPlayers(
			gameOptions.computerPlayerCount,
			raceGrid.getStartingPositions(),
			gameStartTimeStamp,
			raceGrid,
			playerRepository
		);
		humanPlayers.forEach((player) => playerRepository.addPlayer(player));
		computerPlayers.forEach((player) => playerRepository.addPlayer(player));
		return new ServerRaceGameController(
			gameOptions.gameTime * 60 * 1000, //TODO: maybe apply milliseconds conversion before the factory
			gameStartTimeStamp,
			raceGrid,
			playerRepository,
			users,
			gameId,
			ServiceLocator.resolve(serviceConstants.QUESTION_REPOSITORY_CLASS),
			isSinglePlayer
		);
	}
}
