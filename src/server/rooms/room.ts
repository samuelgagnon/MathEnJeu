import { Socket } from "socket.io";
import GameFSM from "../../GameCore/gameState/gameFSM";
import User from "../data/user";

export class Room {
	private id: string;
	private nsp: SocketIO.Namespace;
	private roomString: string;
	private users: User[] = [];
	private gameFSM: GameFSM;

	constructor(id: string, nsp: SocketIO.Namespace, gameFSM: GameFSM, roomString: string) {
		this.id = id;
		this.nsp = nsp;
		this.gameFSM = gameFSM;
		this.roomString = roomString;
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
		this.gameFSM.userJoined(user);
	}

	public leaveRoom(clientSocket: Socket): void {
		const userLeaving = this.users.find((user) => user.userId === clientSocket.id);
		this.users = this.users.filter((user) => user.userId !== clientSocket.id);
		this.gameFSM.userLeft(userLeaving);
		this.removeListeners(clientSocket);
		clientSocket.leave(this.roomString);
	}

	public isRoomEmtpty(): boolean {
		return this.users.length === 0;
	}

	public handleSocketEvents(clientSocket: Socket): void {}

	private removeListeners(clientSocket: Socket) {}
}
