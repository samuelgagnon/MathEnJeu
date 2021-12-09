import { StatusType } from "../../gameCore/race/player/playerStatus/StatusType";
import MoveState from "./MoveState";

export default interface PlayerState {
	id: string;
	name: string;
	points: number;
	helmetIndex: number;
	move: MoveState;
	statusState: StatusState;
	inventoryState: InventoryState;
}

export interface StatusState {
	statusType: StatusType;
	statusTimestamp: number;
}

export interface InventoryState {
	bananaCount: number;
	crystalBallCount: number;
	bookCount: number;
}

export interface PlayerEndState {
	playerId: string;
	points: number;
	name: string;
	//TODO: Maybe put the user information here
	//to know what character model is used and possibly the grade the player is
}
