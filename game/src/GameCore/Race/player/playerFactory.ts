import PlayerState from "../../../Communication/Race/playerState";
import User from "../../../server/data/user";
import Inventory from "./inventory";
import Player from "./player";
import Status from "./playerStatus/status";
import StatusFactory from "./playerStatus/statusFactory";

export default class PlayerFactory {
	public static create(user: User, startLocation: Point, status: Status, inventory: Inventory): Player {
		return new Player(user.userId, startLocation, user.name, status, inventory);
	}

	public static createFromPlayerState(playerState: PlayerState): Player {
		return new Player(
			playerState.id,
			playerState.move.startLocation,
			playerState.name,
			StatusFactory.create(playerState.statusState.statusType, playerState.statusState.statusTimestamp),
			new Inventory(playerState.inventoryState.bananaCount, playerState.inventoryState.bookCount, playerState.inventoryState.crystalBallCount)
		);
	}
}