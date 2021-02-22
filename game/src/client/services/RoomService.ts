import io from "socket.io-client";
import { JoinRoomRequestEvent } from "../../communication/room/DataInterfaces";
import { ROOM_EVENT_NAMES } from "../../communication/room/EventNames";
import { RoomSettings } from "../../communication/room/RoomSettings";
import UserInfo from "../../communication/user/UserInfo";

export const connectToRoomSelectionNamespace = (): SocketIOClient.Socket => {
	const socket = io.connect(`${process.env.SERVER_API_URL}/roomSelection`);
	return socket;
};

export const connectToGameNamespace = (userInfo: UserInfo): SocketIOClient.Socket => {
	const socket = io.connect(`${process.env.SERVER_API_URL}/game`, {
		query: {
			name: userInfo.name,
			language: userInfo.language,
			role: userInfo.role,
			schoolGrade: userInfo.schoolGrade,
		},
	});
	return socket;
};

export const createRoom = (socket: SocketIOClient.Socket, roomSettings: RoomSettings) => {
	socket.emit(ROOM_EVENT_NAMES.CREATE_ROOM, roomSettings);
};

export const joinRoom = (socket: SocketIOClient.Socket, roomId: string) => {
	socket.emit(ROOM_EVENT_NAMES.JOIN_ROOM_REQUEST, <JoinRoomRequestEvent>{ roomId: roomId });
};
