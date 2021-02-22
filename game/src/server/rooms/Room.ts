import { Namespace, Socket } from "socket.io";
import { HostChangeEvent } from "../../communication/race/DataInterfaces";
import { ROOM_EVENT_NAMES, WAITING_ROOM_EVENT_NAMES } from "../../communication/room/EventNames";
import UserInfo from "../../communication/user/UserInfo";
import { ServerGame } from "../../gameCore/Game";
import State, { GameState } from "../../gameCore/gameState/State";
import GameRepository from "../data/GameRepository";
import StatisticsRepository from "../data/StatisticsRepository";
import User from "../data/User";
import { JoinRoomAnswerEvent, RoomInfoEvent, RoomSettings } from "./../../communication/room/DataInterfaces";
import { JoiningFullRoomError, JoiningGameInProgressRoomError } from "./JoinRoomErrors";

/**
 * This class is a final state machine that represents the current state of the room. It is basically the container that will hold each game
 * states like PreGame and RaceGame. Once a state ends, it will transfer to the next state and continue its operations like usual depending
 * on the state it is currently using.
 */
export default class Room {
	private max_player_count = 8;
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
		state: State,
		gameRepo: GameRepository,
		statsRepo: StatisticsRepository,
		roomString: string,
		nsp: Namespace
	) {
		this.id = id;
		this.isPrivate = isPrivate;
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
	public joinRoom(clientSocket: Socket, userInfo: UserInfo): string {
		if (this.users.length >= this.max_player_count) {
			throw new JoiningFullRoomError();
		}

		if (this.getGameState() == GameState.PreGame) {
			const newUser: User = {
				userId: clientSocket.id,
				userInfo: userInfo,
				socket: clientSocket,
			};
			if (!this.users.some((user) => user.userId == newUser.userId)) {
				this.users.push(newUser);
				clientSocket.join(this.roomString);
				this.handleSocketEvents(clientSocket);
				this.state.userJoined(newUser);
			}
			clientSocket.emit(ROOM_EVENT_NAMES.JOIN_ROOM_ANSWER, <JoinRoomAnswerEvent>{ roomId: this.id });

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
		this.users = this.users.filter((user) => user.userId !== userId);
		this.state.userLeft(userLeaving);
		this.removeListeners(userLeaving.socket);
		userLeaving.socket.leave(this.roomString);
		this.emitUsersInRoom();

		//change host there are people remaining and if host left
		if (this.users.length > 0 && userLeaving.userId == this.host.userId) {
			this.changeHost(this.users[0].userId);
		}
	}

	public emitUsersInRoom(): void {
		this.nsp.to(this.roomString).emit(WAITING_ROOM_EVENT_NAMES.ROOM_INFO, <RoomInfoEvent>{
			roomId: this.id,
			usersInfo: this.users.map((user) => user.userInfo),
			hostName: this.host.userInfo.name,
		});
		this.nsp.to(this.roomString).emit(ROOM_EVENT_NAMES.CHANGE_ROOM_SETTINGS, <RoomSettings>{
			isPrivate: this.isPrivate,
			//numberOfPlayers: this.max_player_count,
		});
	}

	public isRoomEmtpty(): boolean {
		return this.users.length === 0;
	}

	private removeListeners(clientSocket: Socket): void {
		clientSocket.removeAllListeners(WAITING_ROOM_EVENT_NAMES.SCENE_LOADED);
	}

	private handleSocketEvents(clientSocket: Socket): void {
		clientSocket.on(WAITING_ROOM_EVENT_NAMES.SCENE_LOADED, () => {
			this.emitUsersInRoom();

			//Notify the user that created the room that he is the host
			if (clientSocket.id == this.host.socket.id) {
				clientSocket.emit(ROOM_EVENT_NAMES.IS_HOST);
			}
		});

		clientSocket.on(ROOM_EVENT_NAMES.CHANGE_ROOM_SETTINGS, (roomSettings: RoomSettings) => {
			this.isPrivate = roomSettings.isPrivate;
			this.max_player_count = roomSettings.numberOfPlayers;
		});
	}

	private changeHost(newHostId: string): void {
		const newHost = this.users.find((user) => user.userId == newHostId);
		this.host = newHost;

		this.nsp.to(this.roomString).emit(ROOM_EVENT_NAMES.HOST_CHANGE, <HostChangeEvent>{ newHostName: newHost.userInfo.name });
		newHost.socket.emit(ROOM_EVENT_NAMES.IS_HOST);
	}
}
