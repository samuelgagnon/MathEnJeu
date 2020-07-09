import { StatusType } from "../../GameCore/Race/player/playerStatus/statusType";
import MoveState from "./moveState";

export default interface PlayerState {
	id: string;
	name: string;
	points: number;
	move: MoveState;
	isAnsweringQuestion: boolean;
	missedQuestionsCount: number;
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
