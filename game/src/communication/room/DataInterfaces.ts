import { UserDTO } from "../user/UserDTO";

export interface RoomSettings {
	maxPlayerCount: number;
	isPrivate: boolean;
}

export interface RoomInfoEvent {
	roomId: string;
	userDTOs: UserDTO[];
	hostName: string;
}

export interface JoinRoomAnswerEvent {
	roomId: string;
	error: Error;
}

export interface JoinRoomRequestEvent {
	roomId: string;
}
