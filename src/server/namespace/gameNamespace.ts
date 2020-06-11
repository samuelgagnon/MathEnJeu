import { Server as SocketIOServer, Socket } from "socket.io";
import RoomRepository from "../data/roomRepository";
import RoomFactory from "../rooms/roomFactory";

export default class GameNamespace {
	private io: SocketIOServer;
	private roomRepo: RoomRepository;
	private nsp: SocketIO.Namespace;
	private readonly namespace: string = "/game";

	constructor(ioServer: SocketIOServer, roomRepo: RoomRepository) {
		this.io = ioServer;
		this.roomRepo = roomRepo;
		this.nsp = this.io.of(this.namespace);
		this.handleSocketEvents();
	}

	private handleSocketEvents(): void {
		this.nsp.on("connection", (socket: Socket) => {
			console.log("connection on game");

			socket.on("disconnect", () => {
				console.log("disconnected");
			});

			socket.on("create-game", (req) => {
				console.log("create game");
				try {
					const newRoom = RoomFactory.create(this.nsp);
					newRoom.joinRoom(socket);
					this.roomRepo.addRoom(newRoom);

					const roomId = newRoom.getRoomId();

					console.log(this.roomRepo);

					this.handleLeavingRoom(socket, roomId);
					this.handleDisconnection(socket, roomId);
				} catch (err) {
					console.log(err);
					socket.error({
						type: 400,
						msg: err.message,
					});
				}
			});

			socket.on("join-game", (req) => {
				const roomId = req.roomId;
				this.roomRepo.getRoomById(roomId).joinRoom(socket);

				this.handleLeavingRoom(socket, roomId);
				this.handleDisconnection(socket, roomId);
			});
		});
	}

	private deleteRoomIfEmpty(roomId: string): void {
		if (this.roomRepo.getRoomById(roomId).isRoomEmtpty()) {
			this.roomRepo.deleteRoomById(roomId);
		}
	}

	private removeUserFromRoom(roomId: string, socket: Socket) {
		const currentRoom = this.roomRepo.getRoomById(roomId);
		currentRoom.leaveRoom(socket);
		this.roomRepo.addRoom(currentRoom);

		this.deleteRoomIfEmpty(roomId);
	}

	private handleDisconnection(socket: Socket, roomId: string): void {
		socket.on("disconnect", () => {
			console.log("disconnection");

			this.removeUserFromRoom(roomId, socket);
		});
	}

	private handleLeavingRoom(socket: Socket, roomId: string): void {
		socket.on("leave-room", () => {
			this.removeUserFromRoom(roomId, socket);
		});
	}
}
