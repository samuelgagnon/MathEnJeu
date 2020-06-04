import { Socket } from "socket.io";

interface Room {
	getRoomId(): string;
	joinRoom(clientSocket: Socket): void;
	leaveRoom(clientSocket: Socket): void;
	isRoomEmtpty(): boolean;
	handleSocketEvents(clientSocket: Socket): void;
}

export default Room;
