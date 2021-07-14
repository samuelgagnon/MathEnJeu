import { PlayerDTO } from "../../../communication/race/PlayerDTO";
import User from "../../../server/rooms/User";
import CharacterFactory from "../character/CharacterFactory";
import { RACE_PARAMETERS } from "../RACE_PARAMETERS";
import ComputerPlayer from "./ComputerPlayer/ComputerPlayer";
import PathFinder from "./ComputerPlayer/PathFinder";
import HumanPlayer from "./HumanPlayer";
import Inventory from "./Inventory";
import Player from "./Player";
import { TargetablePlayers } from "./playerRepository/PlayerRepository";
import Status from "./playerStatus/Status";
import StatusFactory from "./playerStatus/StatusFactory";

export default class PlayerFactory {
	public static createHumanPlayer(user: User, startLocation: Point, status: Status, inventory: Inventory): HumanPlayer {
		return new HumanPlayer(
			user.userId,
			startLocation,
			user.userInfo.name,
			status,
			inventory,
			user.character,
			user.userInfo.schoolGrade,
			user.userInfo.language,
			RACE_PARAMETERS.CIRCUIT.POINTS_CALCULATOR
		);
	}

	public static createComputerPlayer(
		id: string,
		name: string,
		startLocation: Point,
		status: Status,
		inventory: Inventory,
		gameStartTimeStamp: number,
		pathFinder: PathFinder,
		checkpointPositions: Point[][],
		targetablePlayers: TargetablePlayers
	): ComputerPlayer {
		return new ComputerPlayer(
			id,
			startLocation,
			name,
			status,
			inventory,
			CharacterFactory.createRandomCharacter(),
			gameStartTimeStamp,
			pathFinder,
			checkpointPositions,
			targetablePlayers,
			RACE_PARAMETERS.CIRCUIT.POINTS_CALCULATOR
		);
	}

	public static createFromPlayerState(playerDTO: PlayerDTO): Player {
		return new Player(
			playerDTO.state.playerId,
			playerDTO.state.move.startLocation,
			playerDTO.name,
			StatusFactory.create(playerDTO.state.statusState.statusType, playerDTO.state.statusState.statusTimestamp),
			new Inventory(
				playerDTO.state.inventoryState.bananaCount,
				playerDTO.state.inventoryState.bookCount,
				playerDTO.state.inventoryState.crystalBallCount
			),
			playerDTO.character,
			RACE_PARAMETERS.CIRCUIT.POINTS_CALCULATOR
		);
	}
}
