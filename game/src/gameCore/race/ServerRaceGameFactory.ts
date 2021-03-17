import { GameOptions } from "../../communication/race/DataInterfaces";
import { serviceConstants } from "../../server/context/CommonContext";
import ServiceLocator from "../../server/context/ServiceLocator";
import User from "../../server/rooms/User";
import RaceGameFactory from "./RaceGameFactory";
import { RACE_PARAMETERS } from "./RACE_PARAMETERS";
import ServerRaceGameController from "./ServerRaceGameController";

//RaceGameController was split in 2 to prevent unused dependencies to be sent to the client
export default class ServerRaceGameFactory {
	public static createServer(gameId: string, users: User[], gameOptions: GameOptions): ServerRaceGameController {
		const isSinglePlayer = users.length == 1;
		const raceGrid = RaceGameFactory.generateRaceGrid(
			RACE_PARAMETERS.CIRCUIT.GRID_WIDTH,
			RACE_PARAMETERS.CIRCUIT.GRID_HEIGTH,
			RACE_PARAMETERS.CIRCUIT.GRID,
			isSinglePlayer
		);
		let players = RaceGameFactory.generatePlayers(users, raceGrid.getStartingPositions());
		//let compluterPlayers = RaceGameFactory.generateComputerPlayers([Difficulty.HARD], raceGrid.getStartingPositions());
		return new ServerRaceGameController(
			gameOptions.gameTime * 60 * 1000, //TODO: maybe apply milliseconds conversion before the factory
			raceGrid,
			players,
			[],
			users,
			gameId,
			ServiceLocator.resolve(serviceConstants.QUESTION_REPOSITORY_CLASS),
			isSinglePlayer
		);
	}
}
