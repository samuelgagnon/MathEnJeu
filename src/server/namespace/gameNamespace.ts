import { Server as SocketIOServer, Socket } from "socket.io";
import RoomRepository from "../data/roomRepository";
import RoomFactory from "../rooms/roomFactory";
import RoomType from "../rooms/roomType";

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
			const { request, joinRoomId, gameType } = socket.handshake.query;

			switch (request) {
				case "create":
					if (!Object.values(RoomType).includes(gameType)) {
						socket.error({
							type: 400,
							msg: "Invalid room type",
						});
					} else {
						const newRoom = RoomFactory.create(gameType, this.nsp);
						newRoom.joinRoom(socket);
						this.roomRepo.addRoom(newRoom);

						const roomId = newRoom.getRoomId();

						console.log(this.roomRepo);

						this.handleLeavingRoom(socket, roomId);
						this.handleDisconnection(socket, roomId);
					}

					break;

				case "join":
					this.roomRepo.getRoomById(joinRoomId).joinRoom(socket);

					this.handleLeavingRoom(socket, joinRoomId);
					this.handleDisconnection(socket, joinRoomId);

					break;

				default:
					socket.error({
						type: 400,
						msg: "Invalid request",
					});
			}
		});
	}

	private deleteRoomIfEmpty(roomId: string): void {
		if (this.roomRepo.getRoomById(roomId).isRoomEmtpty()) {
			this.roomRepo.deleteRoomById(roomId);
		}
	}

	private removingUserFromRoom(roomId: string, socket: Socket) {
		const currentRoom = this.roomRepo.getRoomById(roomId);
		currentRoom.leaveRoom(socket);
		this.roomRepo.addRoom(currentRoom);

		this.deleteRoomIfEmpty(roomId);
	}

	private handleDisconnection(socket: Socket, roomId: string): void {
		socket.on("disconnect", () => {
			console.log("disconnection");

			this.removingUserFromRoom(roomId, socket);
		});
	}

	private handleLeavingRoom(socket: Socket, roomId: string): void {
		socket.on("leave-room", () => {
			this.removingUserFromRoom(roomId, socket);
		});
	}
}
