import io from "socket.io-client";
const CREATE_STRING = "create";
const JOIN_STRING = "join";

export const connectToRoomSelectionNamespace = (): SocketIOClient.Socket => {
	const socket = io.connect("http://localhost:8080/roomSelection");
	return socket;
};

export const connectToGameNamespace = (): SocketIOClient.Socket => {
	const socket = io.connect("http://localhost:8080/game");
	return socket;
};

export const createRoom = (socket: SocketIOClient.Socket, gameType: string) => {
	socket.emit("create-game");
};

export const joinRoom = (socket: SocketIOClient.Socket, roomId: string) => {
	socket.emit("join-game", { roomId: roomId });
};
