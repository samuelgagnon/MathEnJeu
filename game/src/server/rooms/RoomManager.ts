import { Server as SocketIOServer, Socket } from "socket.io";
import { ROOM_EVENT_NAMES } from "../../communication/room/EventNames";
import UserInfo from "../../communication/userInfo";
import RoomRepository from "../data/RoomRepository";
import RoomFactory from "./RoomFactory";

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
			const { name, language, role, schoolGrade } = socket.handshake.query;

			const userInfo: UserInfo = {
				name: name,
				schoolGrade: schoolGrade,
				language: language,
				role: role,
			};

			socket.on("disconnect", () => {
				console.log("disconnected");
			});

			socket.on(ROOM_EVENT_NAMES.CREATE_ROOM, () => {
				try {
					const newRoom = RoomFactory.create(this.nsp);
					newRoom.joinRoom(socket, userInfo);
					console.log(newRoom);
					this.roomRepo.addRoom(newRoom);

					const roomId = newRoom.getRoomId();

					this.handleDisconnection(socket, roomId);
					console.log("room created");
				} catch (err) {
					socket.error({
						type: 400,
						msg: err.message,
					});
				}
			});

			socket.on(ROOM_EVENT_NAMES.JOIN_ROOM, (req) => {
				try {
					const roomId: string = req.roomId;
					console.log(`joining room: ${roomId}`);
					const currentRoom = this.roomRepo.getRoomById(roomId);
					if (currentRoom == undefined) {
						throw new RoomNotFoundError(`Room ${roomId} was not found`);
					}

					currentRoom.joinRoom(socket, userInfo);
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
			this.removeUserFromRoom(roomId, socket);
		});
	}
}
