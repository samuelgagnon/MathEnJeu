import UserInfo from "../user/UserInfo";

export interface RoomSettings {
	maxPlayerCount: number;
	isPrivate: boolean;
}

export interface RoomInfoEvent {
	roomId: string;
	userDTOs: UserDTO[];
	hostName: string;
}

export interface UserDTO {
	userId: string;
	userInfo: UserInfo;
}

export interface JoinRoomAnswerEvent {
	roomId: string;
	error: Error;
}

export interface JoinRoomRequestEvent {
	roomId: string;
}
