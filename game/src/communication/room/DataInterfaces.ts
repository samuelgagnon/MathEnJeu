export interface JoinRoomAnswerEvent {
	roomId: string;
	error: Error;
}

export interface JoinRoomRequestEvent {
	roomId: string;
}
