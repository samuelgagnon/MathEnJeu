import { GameOptions } from "../../communication/race/DataInterfaces";
import { serviceConstants } from "../../server/context/CommonContext";
import ServiceLocator from "../../server/context/ServiceLocator";
import User from "../../server/rooms/User";
import { Clock } from "../clock/Clock";
import PlayerInMemoryRepository from "./player/playerRepository/PlayerInMemoryRepository";
import RaceGameFactory from "./RaceGameFactory";
import { RACE_PARAMETERS } from "./RACE_PARAMETERS";
import ServerRaceGameController from "./ServerRaceGameController";

//RaceGameController was split in 2 to prevent unused dependencies to be sent to the client
export default class ServerRaceGameFactory {
	public static createServer(gameId: string, users: User[], gameOptions: GameOptions): ServerRaceGameController {
		const gameStartTimeStamp = Clock.now() + RACE_PARAMETERS.CIRCUIT.STARTING_TRANSITION_DURATION;
		const isSinglePlayer = users.length == 1;
		const raceGrid = RaceGameFactory.generateRaceGrid(
			RACE_PARAMETERS.CIRCUIT.GRID_WIDTH,
			RACE_PARAMETERS.CIRCUIT.GRID_HEIGTH,
			RACE_PARAMETERS.CIRCUIT.GRID,
			isSinglePlayer
		);
		let playerRepo = new PlayerInMemoryRepository();
		const humanPlayers = RaceGameFactory.generateHumanPlayers(users, raceGrid.getStartingPositions());
		const computerPlayers = RaceGameFactory.generateComputerPlayers(
			gameOptions.computerPlayerCount,
			raceGrid.getStartingPositions(),
			gameStartTimeStamp,
			raceGrid
		);
		humanPlayers.forEach((player) => playerRepo.addPlayer(player));
		computerPlayers.forEach((player) => playerRepo.addPlayer(player));
		return new ServerRaceGameController(
			gameOptions.gameTime * 60 * 1000, //TODO: maybe apply milliseconds conversion before the factory
			gameStartTimeStamp,
			raceGrid,
			playerRepo,
			users,
			gameId,
			ServiceLocator.resolve(serviceConstants.QUESTION_REPOSITORY_CLASS),
			isSinglePlayer
		);
	}
}
