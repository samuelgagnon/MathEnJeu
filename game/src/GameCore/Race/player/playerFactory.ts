import User from "../../../server/data/user";
import Inventory from "./inventory";
import Player from "./player";
import Status from "./playerStatus/status";

export default class PlayerFactory {
	public static create(user: User, startLocation: Point, status: Status, inventory: Inventory): Player {
		return new Player(user.userId, startLocation, user.name, status, inventory);
	}
}
