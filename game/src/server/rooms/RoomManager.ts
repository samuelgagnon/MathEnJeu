import { Server as SocketIOServer, Socket } from "socket.io";
import { TimeRequestEvent, TimeResponseEvent } from "../../communication/clock/DataInterfaces";
import UserInfo from "../../communication/userInfo";
import { Clock } from "../../gameCore/clock/Clock";
import RoomRepository from "../data/RoomRepository";
import { CLIENT_EVENT_NAMES as CE, SERVER_EVENT_NAMES as SE } from "./../../communication/clock/EventNames";
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

			socket.on(SE.TIME_REQUEST, (timeRequestEvent: TimeRequestEvent) => {
				const serverCurrentLocalTime = Clock.now();
				socket.emit(CE.TIME_RESPONSE, <TimeResponseEvent>{
					clientCurrentLocalTime: timeRequestEvent.clientCurrentLocalTime,
					serverCurrentLocalTime: serverCurrentLocalTime,
				});
			});

			socket.on("create-room", () => {
				console.log("create room");
				try {
					const newRoom = RoomFactory.create(this.nsp);
					newRoom.joinRoom(socket, userInfo);
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
					const currentRoom = this.roomRepo.getRoomById(roomId);
					if (currentRoom == undefined) {
						throw new RoomNotFoundError(`Room ${roomId} was not found`);
					}

					currentRoom.joinRoom(socket, userInfo);
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
