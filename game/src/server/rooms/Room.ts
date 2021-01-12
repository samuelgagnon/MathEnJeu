import { Socket } from "socket.io";
import { HostChangeEvent, UsersInfoSentEvent } from "../../communication/race/DataInterfaces";
import { WAITING_ROOM_EVENT_NAMES } from "../../communication/race/EventNames";
import UserInfo from "../../communication/userInfo";
import GameFSM from "../../gameCore/gameState/GameFSM";
import { GameState } from "../../gameCore/gameState/State";
import User from "../data/User";

export class Room {
	private id: string;
	private nsp: SocketIO.Namespace;
	private roomString: string;
	private users: User[] = [];
	private gameFSM: GameFSM;
	private host: User;

	constructor(id: string, nsp: SocketIO.Namespace, gameFSM: GameFSM, roomString: string) {
		this.id = id;
		this.nsp = nsp;
		this.gameFSM = gameFSM;
		this.roomString = roomString;
	}

	public getRoomId(): string {
		return this.id;
	}

	public getGameState(): GameState {
		return this.gameFSM.getGameState();
	}

	public joinRoom(clientSocket: Socket, userInfo: UserInfo): void {
		if (this.gameFSM.getGameState() == GameState.PreGame) {
			const user: User = {
				userId: clientSocket.id,
				userInfo: userInfo,
				socket: clientSocket,
				schoolGrade: userInfo.schoolGrade,
				language: userInfo.language,
			};

			this.users.push(user);
			clientSocket.join(this.roomString);
			this.handleSocketEvents(clientSocket);
			this.gameFSM.userJoined(user);
			clientSocket.emit("room-joined");

			//make user host when they're the first joining the room
			if (this.users.length == 1) {
				this.changeHost(user.userId);
			}
			this.emitUsersInRoom();
		} else {
			throw new RoomNotFoundError(`Room ${this.id} is currently in progress. You cannot join right now.`);
		}
	}

	public leaveRoom(clientSocket: Socket): void {
		const userLeaving = this.users.find((user) => user.userId === clientSocket.id);
		this.users = this.users.filter((user) => user.userId !== clientSocket.id);
		this.gameFSM.userLeft(userLeaving);
		this.removeListeners(clientSocket);
		clientSocket.leave(this.roomString);
		this.emitUsersInRoom();

		//change host there are people remaining and if host left
		if (this.users.length > 0 && userLeaving.userId == this.host.userId) {
			this.changeHost(this.users[0].userId);
		}
	}

	public emitUsersInRoom(): void {
		this.nsp.to(this.roomString).emit(WAITING_ROOM_EVENT_NAMES.CURRENT_USERS, <UsersInfoSentEvent>{
			usersInfo: this.users.map((user) => user.userInfo),
			hostName: this.host.userInfo.name,
		});
	}

	public isRoomEmtpty(): boolean {
		return this.users.length === 0;
	}

	public handleSocketEvents(clientSocket: Socket): void {
		clientSocket.on(WAITING_ROOM_EVENT_NAMES.SCENE_LOADED, () => {
			this.emitUsersInRoom();

			//Notify the user that created the room that he is the host
			if (clientSocket.id == this.host.socket.id) {
				clientSocket.emit("is-host");
			}
		});
	}

	private removeListeners(clientSocket: Socket): void {
		clientSocket.removeAllListeners(WAITING_ROOM_EVENT_NAMES.SCENE_LOADED);
	}

	private changeHost(newHostId: string): void {
		const newHost = this.users.find((user) => user.userId == newHostId);
		this.host = newHost;

		this.nsp.to(this.roomString).emit("host-change", <HostChangeEvent>{ newHostName: newHost.userInfo.name });
		newHost.socket.emit("is-host");
	}
}
