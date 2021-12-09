import { Namespace, Socket } from "socket.io";
import {
	GameInitializedEvent,
	HostChangeEvent,
	JoinRoomAnswerEvent,
	ReadyEvent,
	RoomInfoEvent,
	RoomSettings,
} from "../../communication/room/EventInterfaces";
import { ROOM_EVENT_NAMES, WAITING_ROOM_EVENT_NAMES } from "../../communication/room/EventNames";
import UserInfo from "../../communication/user/UserInfo";
import { ServerGame } from "../../gameCore/Game";
import State, { GameState } from "../../gameCore/gameState/State";
import GameRepository from "../data/GameRepository";
import StatisticsRepository from "../data/StatisticsRepository";
import { JoiningFullRoomError, JoiningGameInProgressRoomError } from "./JoinRoomErrors";
import User, { UserToDTO } from "./User";

/**
 * This class is a final state machine that represents the current state of the room. It is basically the container that will hold each game
 * states like PreGame and RaceGame. Once a state ends, it will transfer to the next state and continue its operations like usual depending
 * on the state it is currently using.
 */
export default class Room {
	private maxPlayerCount: number;
	private createTime: number;
	private readonly id: string;
	private isPrivate: boolean;
	private state: State;
	//Room string is used to distinguish rooms from each other and directly emit events to specific rooms with socket.io
	private readonly roomString: string;
	private users: User[] = [];
	private nsp: SocketIO.Namespace;
	private gameRepo: GameRepository;
	private statsRepo: StatisticsRepository;
	private host: User;

	constructor(
		id: string,
		isPrivate: boolean,
		maxPlayerCount: number,
		createTime: number,
		state: State,
		gameRepo: GameRepository,
		statsRepo: StatisticsRepository,
		roomString: string,
		nsp: Namespace
	) {
		this.id = id;
		this.isPrivate = isPrivate;
		this.maxPlayerCount = maxPlayerCount;
		this.createTime = createTime;
		this.roomString = roomString;
		this.nsp = nsp;
		this.gameRepo = gameRepo;
		this.statsRepo = statsRepo;
		//setting up starting state
		this.transitionTo(state);
	}

	public getId(): string {
		return this.id;
	}

	public getIsPrivate(): boolean {
		return this.isPrivate;
	}

	public setIsPrivate(isPrivate: boolean): void {
		this.isPrivate = isPrivate;
	}

	public getStatsRepo(): StatisticsRepository {
		return this.statsRepo;
	}

	public getUsers(): User[] {
		return this.users;
	}

	public getUserById(userId: string): User {
		return this.users.find((user) => user.userId == userId);
	}

	public getRoomString(): string {
		return this.roomString;
	}

	public getNamespace(): SocketIO.Namespace {
		return this.nsp;
	}

	public getGameState(): GameState {
		return this.state.getStateType();
	}

	public areUsersReady(): boolean {
		return this.users.every((user) => user.isReady);
	}

	public unreadyUsers(): void {
		this.users.forEach((user) => (user.isReady = false));
	}

	public transitionTo(nextState: State): void {
		this.state = nextState;
		this.state.setContext(this);
	}

	public addGameToRepo(game: ServerGame): void {
		this.gameRepo.addGame(game);
	}

	public removeGameFromRepo(game: ServerGame): void {
		this.gameRepo.deleteGameById(game.getGameId());
	}

	/**
	 * Returns the userId from the user who joined the room
	 */
	public joinRoom(clientSocket: Socket, userInfo: UserInfo, type): string {
		if (this.users.length >= this.maxPlayerCount) {
			throw new JoiningFullRoomError();
		}

		if (this.getGameState() == GameState.PreGame) {
			const newUser: User = {
				isReady: false,
				helmetIndex: 0,
				userId: clientSocket.id,
				userInfo: userInfo,
				socket: clientSocket,
			};
			if (!this.users.some((user) => user.userId == newUser.userId)) {
				this.users.push(newUser);
				clientSocket.join(this.roomString);
				this.handleSocketEvents(clientSocket, newUser.userId);
				this.state.userJoined(newUser);

				if (this.users.length === this.maxPlayerCount) {
					this.state.setFullFilled();
				}
			}
			clientSocket.emit(ROOM_EVENT_NAMES.JOIN_ROOM_ANSWER, <JoinRoomAnswerEvent>{ roomId: this.id, isCreateRoom: type });

			//make user host when they're the first joining the room
			if (this.users.length == 1) {
				this.changeHost(newUser.userId);
			}
			this.emitUsersInRoom();
			return newUser.userId;
		} else {
			throw new JoiningGameInProgressRoomError();
		}
	}

	public leaveRoom(userId: string): void {
		const userLeaving = this.users.find((user) => user.userId === userId);
		if (userLeaving === undefined) return;
		this.removeUser(userId);

		//change host there are people remaining and if host left
		if (this.users.length > 0 && userLeaving.userId == this.host.userId) {
			this.changeHost(this.users[0].userId);
		}
	}

	private removeUser(userId: string): void {
		const userLeaving = this.users.find((user) => user.userId === userId);
		//user may have already been kicked and event is triggered on disconnection
		if (userLeaving === undefined) return undefined;
		this.users = this.users.filter((user) => user.userId !== userId);
		this.state.userLeft(userLeaving);
		this.removeListeners(userLeaving.socket);
		userLeaving.socket.leave(this.roomString);
		this.emitUsersInRoom();
	}

	public emitUsersInRoom(): void {
		this.nsp.to(this.roomString).emit(WAITING_ROOM_EVENT_NAMES.CLIENT_EVENT.ROOM_INFO, <RoomInfoEvent>{
			roomId: this.id,
			userDTOs: this.users.map((user) => UserToDTO(user)),
			hostName: this.host.userInfo.name,
		});
		this.nsp.to(this.roomString).emit(ROOM_EVENT_NAMES.CHANGE_ROOM_SETTINGS, <RoomSettings>{
			isPrivate: this.isPrivate,
			maxPlayerCount: this.maxPlayerCount,
			createTime: this.createTime,
		});
	}

	public isRoomEmtpty(): boolean {
		return this.users.length === 0;
	}

	private removeListeners(clientSocket: Socket): void {
		clientSocket.removeAllListeners(WAITING_ROOM_EVENT_NAMES.SERVER_EVENT.SCENE_LOADED);
	}

	private handleSocketEvents(clientSocket: Socket, userId: string): void {
		clientSocket.on(WAITING_ROOM_EVENT_NAMES.SERVER_EVENT.SCENE_LOADED, () => {
			this.emitUsersInRoom();

			//Notify the user that created the room that he is the host
			// if (clientSocket.id == this.host.socket.id) {
			// 	clientSocket.emit(ROOM_EVENT_NAMES.IS_HOST);
			// }
		});

		clientSocket.on(ROOM_EVENT_NAMES.CHANGE_ROOM_SETTINGS, (roomSettings: RoomSettings) => {
			this.changeRoomSettings(roomSettings);
		});

		clientSocket.on(WAITING_ROOM_EVENT_NAMES.SERVER_EVENT.KICK_PLAYER, (userId: string) => {
			//Only the host can kick players, deny the request if it isn't the host
			//The host cannot kick himself
			if (clientSocket.id === this.host.socket.id && userId != this.host.userId) {
				this.kickPlayer(userId);
			}
		});

		clientSocket.on(WAITING_ROOM_EVENT_NAMES.SERVER_EVENT.READY, (data) => {
			this.toggleReadyState(userId, data);
			this.emitUsersInRoom();
		});

		clientSocket.on(WAITING_ROOM_EVENT_NAMES.SERVER_EVENT.CHANGE_HELMET, (data) => {
			let selectedUser = this.users.find((user) => user.userId === userId);
			selectedUser.helmetIndex = data.helmetIndex;
		});
	}

	private changeRoomSettings(roomSettings: RoomSettings) {
		this.isPrivate = roomSettings.isPrivate;
		if (this.maxPlayerCount < roomSettings.maxPlayerCount) {
			this.state.setPreGame();
		}
		this.maxPlayerCount = roomSettings.maxPlayerCount;
		this.createTime = roomSettings.createTime;
		this.emitUsersInRoom();
	}

	private changeHost(newHostId: string): void {
		const newHost = this.users.find((user) => user.userId == newHostId);
		this.host = newHost;

		this.nsp.to(this.roomString).emit(ROOM_EVENT_NAMES.HOST_CHANGE, <HostChangeEvent>{ newHostName: newHost.userInfo.name });
		newHost.socket.emit(ROOM_EVENT_NAMES.IS_HOST);
	}

	private kickPlayer(userId: string): void {
		const kickedUser = this.users.find((user) => user.userId === userId);
		//leave method if user doesn't exist
		if (kickedUser === undefined) return;
		this.removeUser(userId);
		kickedUser.socket.emit(WAITING_ROOM_EVENT_NAMES.CLIENT_EVENT.KICKED);
	}

	private toggleReadyState(userId: string, data: any): void {
		let userToToggle = this.users.find((user) => user.userId === userId);
		userToToggle.isReady = !userToToggle.isReady;
		userToToggle.helmetIndex = data.helmetIndex;
	}

	/**
	 * Notice clients (players) that the game is initialized (game start countdown is started).
	 * @param preGameToInGameTimestamp The timestamp where the pregame to ingame transition will take place.
	 */
	public gameInitialized(preGameToInGameTimestamp: number): void {
		this.nsp.to(this.roomString).emit(WAITING_ROOM_EVENT_NAMES.CLIENT_EVENT.GAME_INITIALIZED, <GameInitializedEvent>{
			preGameToInGameTimestamp: preGameToInGameTimestamp,
		});
	}

	public cancelGameInitialized() {
		this.nsp.to(this.roomString).emit(WAITING_ROOM_EVENT_NAMES.CLIENT_EVENT.GAME_INITIALIZATION_CANCELED);
	}
}
