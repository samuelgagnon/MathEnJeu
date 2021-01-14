import { GameOptions } from "../../communication/race/DataInterfaces";
import { serviceConstants } from "../../server/context/CommonContext";
import ServiceLocator from "../../server/context/ServiceLocator";
import User from "../../server/data/User";
import RaceGameFactory from "./RaceGameFactory";
import { RACE_CST } from "./RACE_CST";
import ServerRaceGameController from "./ServerRaceGameController";

//RaceGameController was split in 2 to prevent unused dependencies to be sent to the client
export default class ServerRaceGameFactory {
	public static createServer(gameId: string, users: User[], gameOptions: GameOptions): ServerRaceGameController {
		const raceGrid = RaceGameFactory.generateRaceGrid(RACE_CST.CIRCUIT.GRID_WIDTH, RACE_CST.CIRCUIT.GRID_HEIGTH, RACE_CST.CIRCUIT.GRID);
		const players = RaceGameFactory.generatePlayers(users, raceGrid.getStartingPositions());
		return new ServerRaceGameController(
			gameOptions.gameTime * 60 * 1000, //TODO: maybe apply milliseconds conversion before the factory
			raceGrid,
			players,
			users,
			gameId,
			ServiceLocator.resolve(serviceConstants.QUESTION_REPOSITORY_CLASS)
		);
	}
}
