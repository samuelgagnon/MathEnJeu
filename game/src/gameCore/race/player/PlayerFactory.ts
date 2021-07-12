import PlayerState from "../../../communication/race/PlayerState";
import User from "../../../server/rooms/User";
import Character from "../character/Character";
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
	public static createHumanPlayer(user: User, startLocation: Point, status: Status, inventory: Inventory, character: Character): HumanPlayer {
		return new HumanPlayer(
			user.userId,
			startLocation,
			user.userInfo.name,
			status,
			inventory,
			character,
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

	public static createFromPlayerState(playerState: PlayerState): Player {
		return new Player(
			playerState.id,
			playerState.move.startLocation,
			playerState.name,
			StatusFactory.create(playerState.statusState.statusType, playerState.statusState.statusTimestamp),
			new Inventory(playerState.inventoryState.bananaCount, playerState.inventoryState.bookCount, playerState.inventoryState.crystalBallCount),
			RACE_PARAMETERS.CIRCUIT.POINTS_CALCULATOR
		);
	}
}
