import { serviceConstants } from "../../server/context/CommonContext";
import ServiceLocator from "../../server/context/ServiceLocator";
import User from "../../server/data/User";
import RaceGameFactory from "./RaceGameFactory";
import { RACE_CST } from "./RACE_CST";
import ServerRaceGameController from "./ServerRaceGameController";

export default class ServerRaceGameFactory {
	public static createServer(gameId: string, users: User[]): ServerRaceGameController {
		const raceGrid = RaceGameFactory.generateRaceGrid(RACE_CST.CIRCUIT.GRID_WIDTH, RACE_CST.CIRCUIT.GRID_HEIGTH, RACE_CST.CIRCUIT.GRID);
		const players = RaceGameFactory.generatePlayers(users, raceGrid.getStartingPositions());
		return new ServerRaceGameController(
			RACE_CST.CIRCUIT.GAME_MAX_LENGTH,
			raceGrid,
			players,
			users,
			gameId,
			ServiceLocator.resolve(serviceConstants.QUESTION_REPOSITORY_CLASS)
		);
	}
}
