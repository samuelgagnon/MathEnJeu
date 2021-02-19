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
