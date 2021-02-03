import { Namespace, Socket } from "socket.io";
import { HostChangeEvent, UsersInfoSentEvent } from "../../communication/race/DataInterfaces";
import { WAITING_ROOM_EVENT_NAMES } from "../../communication/race/EventNames";
import UserInfo from "../../communication/user/UserInfo";
import { ServerGame } from "../../gameCore/Game";
import State, { GameState } from "../../gameCore/gameState/State";
import GameRepository from "../data/GameRepository";
import StatisticsRepository from "../data/StatisticsRepository";
import User from "../data/User";

/**
 * This class is a final state machine that represents the current state of the room. It is basically the container that will hold each game
 * states like PreGame and RaceGame. Once a state ends, it will transfer to the next state and continue its operations like usual depending
 * on the state it is currently using.
 */
export default class Room {
	private max_player_count = 8;
	private readonly id: string;
	private state: State;
	//Room string is used to distinguish rooms from each other and directly emit events to specific rooms with socket.io
	private readonly roomString: string;
	private users: User[] = [];
	private nsp: SocketIO.Namespace;
	private gameRepo: GameRepository;
	private statsRepo: StatisticsRepository;
	private host: User;

	constructor(id: string, state: State, gameRepo: GameRepository, statsRepo: StatisticsRepository, roomString: string, nsp: Namespace) {
		this.id = id;
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

	public joinRoom(clientSocket: Socket, userInfo: UserInfo): void {
		if (this.users.length >= this.max_player_count) {
			throw new RoomFullError(`Room ${this.id} is currently full. You cannot join right now.`);
		}

		if (this.getGameState() == GameState.PreGame) {
			const user: User = {
				userId: clientSocket.id,
				userInfo: userInfo,
				socket: clientSocket,
			};

			this.users.push(user);
			clientSocket.join(this.roomString);
			this.handleSocketEvents(clientSocket);
			this.state.userJoined(user);
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
		this.state.userLeft(userLeaving);
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

	private removeListeners(clientSocket: Socket): void {
		clientSocket.removeAllListeners(WAITING_ROOM_EVENT_NAMES.SCENE_LOADED);
	}

	private handleSocketEvents(clientSocket: Socket): void {
		clientSocket.on(WAITING_ROOM_EVENT_NAMES.SCENE_LOADED, () => {
			this.emitUsersInRoom();

			//Notify the user that created the room that he is the host
			if (clientSocket.id == this.host.socket.id) {
				clientSocket.emit("is-host");
			}
		});
	}

	private changeHost(newHostId: string): void {
		const newHost = this.users.find((user) => user.userId == newHostId);
		this.host = newHost;

		this.nsp.to(this.roomString).emit("host-change", <HostChangeEvent>{ newHostName: newHost.userInfo.name });
		newHost.socket.emit("is-host");
	}
}
