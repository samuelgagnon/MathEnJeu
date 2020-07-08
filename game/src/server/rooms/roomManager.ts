import { Server as SocketIOServer, Socket } from "socket.io";
import RoomRepository from "../data/roomRepository";
import RoomFactory from "./roomFactory";

export default class RoomManager {
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

			socket.on("create-room", () => {
				console.log("create room");
				try {
					const newRoom = RoomFactory.create(this.nsp);
					newRoom.joinRoom(socket);
					this.roomRepo.addRoom(newRoom);

					const roomId = newRoom.getRoomId();

					this.handleLeavingRoom(socket, roomId);
					this.handleDisconnection(socket, roomId);
				} catch (err) {
					socket.error({
						type: 400,
						msg: err.message,
					});
				}
			});

			socket.on("join-room", (req) => {
				try {
					const roomId: string = req.roomId;
					console.log(`joining room: ${roomId}`);
					const currentRoom = this.roomRepo.getRoomById(roomId);
					if (currentRoom == undefined) {
						throw new RoomNotFoundError(`Room ${roomId} was not found`);
					}

					currentRoom.joinRoom(socket);
					this.handleLeavingRoom(socket, roomId);
					this.handleDisconnection(socket, roomId);
				} catch (err) {
					socket.error({
						type: 400,
						msg: err.message,
					});
				}
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
