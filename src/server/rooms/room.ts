import { Socket } from "socket.io";

interface Room {
	joinRoom(clientSocket: Socket): void;
	leaveRoom(clientSocket: Socket): void;
}

export default Room;
