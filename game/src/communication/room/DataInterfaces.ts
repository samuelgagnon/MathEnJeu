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

export interface HostChangeEvent {
	newHostName: string;
}

//this includes the games options selected by the host
export interface GameOptions {
	gameTime: number;
}
