import { Socket } from "socket.io";
import User from "../data/user";
import GameFSM from "../../GameCore/gameState/gameFSM";

export class Room {
	private id: string;
	private nsp: SocketIO.Namespace;
	private roomString: string;
	private users: User[] = [];
	private gameFSM: GameFSM;

	constructor(id: string, nsp: SocketIO.Namespace) {
		this.id = id;
		this.nsp = nsp;
		this.roomString = `room-${this.id}`;
	}

	public getRoomId(): string {
		return this.id;
	}

	public joinRoom(clientSocket: Socket): void {
		const user: User = {
			userId: clientSocket.id,
			socket: clientSocket,
		};
		this.users.push(user);
		clientSocket.join(this.roomString);
		this.handleSocketEvents(clientSocket);

		console.log(this.users);
	}

	public leaveRoom(clientSocket: Socket): void {
		this.users = this.users.filter((user) => user.userId !== clientSocket.id);
		this.removeListeners(clientSocket);
		clientSocket.leave(this.roomString);

		console.log(this.users);
	}

	public isRoomEmtpty(): boolean {
		return this.users.length === 0;
	}

	public handleSocketEvents(clientSocket: Socket): void {}

	private removeListeners(clientSocket: Socket) {}
}
