import MoveState from "./moveState";

export default interface PlayerState {
	socketId: string;
	points: number;
	move: MoveState;
}
