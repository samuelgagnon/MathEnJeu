import { Server as SocketIOServer, Socket } from "socket.io";
import Room from "./room";

export class RaceRoom implements Room {
	private id: string;
	private socketServer: SocketIOServer;
	private roomString: string;

	constructor(id: string, socketServer: SocketIOServer) {
		this.id = id;
		this.socketServer = socketServer;
		this.roomString = `room-${this.id}`;
	}
	public joinRoom(clientSocket: Socket): void {
		clientSocket.join(this.roomString);
	}

	public leaveRoom(clientSocket: Socket): void {
		clientSocket.leave(this.roomString);
	}

	private handleEvents(): void {
		this.socketServer.sockets.in(this.roomString).emit("emitToRoom", () => {});
	}
}
