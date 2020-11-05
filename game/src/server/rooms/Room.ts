import { Socket } from "socket.io";
import { UsersInfoSentEvent } from "../../communication/race/DataInterfaces";
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
		if(this.gameFSM.getGameState() == GameState.PreGame) {
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
	}

	public emitUsersInRoom(): void {
		this.nsp
			.to(this.roomString)
			.emit(WAITING_ROOM_EVENT_NAMES.CURRENT_USERS, <UsersInfoSentEvent>{ usersInfo: this.users.map((user) => user.userInfo) });
	}

	public isRoomEmtpty(): boolean {
		return this.users.length === 0;
	}

	public handleSocketEvents(clientSocket: Socket): void {
		clientSocket.on(WAITING_ROOM_EVENT_NAMES.SCENE_LOADED, () => {
			this.emitUsersInRoom();
		});
	}

	private removeListeners(clientSocket: Socket) {
		clientSocket.removeAllListeners(WAITING_ROOM_EVENT_NAMES.SCENE_LOADED);
	}
}
