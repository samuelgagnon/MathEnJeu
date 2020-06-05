import { Server as SocketIOServer, Socket } from "socket.io";
import RaceGame from "../../GameCore/GameModes/RaceGame";
import User from "../user";
import Room from "./room";

export class RaceRoom implements Room {
	private id: string;
	private io: SocketIOServer;
	private roomString: string;
	private users: User[];
	private game: RaceGame;

	constructor(id: string, socketServer: SocketIOServer) {
		this.id = id;
		this.io = socketServer;
		this.roomString = `room-${this.id}`;
	}

	public getRoomId(): string {
		return this.id;
	}

	public joinRoom(clientSocket: Socket): void {
		const user: User = {
			socket: clientSocket,
			currentRoomId: this.getRoomId(),
		};
		clientSocket.join(this.roomString);
		this.handleSocketEvents(clientSocket);
	}

	public leaveRoom(clientSocket: Socket): void {
		this.removeListeners(clientSocket);
		clientSocket.leave(this.roomString);
	}

	public isRoomEmtpty(): boolean {
		return this.users.length === 0;
	}

	public handleSocketEvents(clientSocket: Socket): void {
		clientSocket.on("race-client-room-update", (req) => {
			clientSocket.emit("race-client-room-update", { test: "test" });
		});
	}

	private removeListeners(clientSocket: Socket) {
		clientSocket.removeAllListeners("race-client-room-update");
	}
}
