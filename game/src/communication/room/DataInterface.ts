import UserInfo from "../user/UserInfo";

export interface RoomSettings {
	maxPlayerCount: number;
	isPrivate: boolean;
}

export interface RoomInfoEvent {
	roomId: string;
	usersInfo: UserInfo[];
	hostName: string;
}
