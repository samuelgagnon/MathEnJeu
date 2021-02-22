import UserInfo from "../user/UserInfo";

export interface RoomSettings {
	numberOfPlayers: number;
	isPrivate: boolean;
}

export interface RoomInfoEvent {
	roomId: string;
	usersInfo: UserInfo[];
	hostName: string;
}

export interface JoinRoomAnswerEvent {
	roomId: string;
	error: Error;
}

export interface JoinRoomRequestEvent {
	roomId: string;
}
