import { QuestionState } from "../../gameCore/race/player/playerStatus/QuestionState";
import { StatusType } from "../../gameCore/race/player/playerStatus/StatusType";
import MoveState from "./MoveState";

export default interface PlayerState {
	playerId: string;
	points: number;
	move: MoveState;
	statusState: StatusState;
	inventoryState: InventoryState;
	questionState: QuestionState;
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
