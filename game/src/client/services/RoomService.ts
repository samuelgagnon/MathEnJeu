import io from "socket.io-client";
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

export const createRoom = (socket: SocketIOClient.Socket) => {
	socket.emit("create-room");
};

export const joinRoom = (socket: SocketIOClient.Socket, roomId: string) => {
	socket.emit("join-room", { roomId: roomId });
};
