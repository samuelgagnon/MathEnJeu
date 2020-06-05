import { Socket } from "socket.io";
export default interface User {
	socket: Socket;
	currentRoomId: string;
}
