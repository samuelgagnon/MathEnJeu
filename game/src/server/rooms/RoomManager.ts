import { Server as SocketIOServer, Socket } from "socket.io";
import { TimeRequestEvent, TimeResponseEvent } from "../../communication/clock/EventInterfaces";
import { JoinRoomAnswerEvent, JoinRoomRequestEvent, RoomSettings } from "../../communication/room/EventInterfaces";
import { ROOM_EVENT_NAMES } from "../../communication/room/EventNames";
import UserInfo from "../../communication/user/UserInfo";
import { Clock } from "../../gameCore/clock/Clock";
import RoomRepository from "../data/RoomRepository";
import { CLIENT_EVENT_NAMES as CE, SERVER_EVENT_NAMES as SE } from "./../../communication/clock/EventNames";
import { JoiningNonExistentRoomError } from "./JoinRoomErrors";
import Room from "./Room";
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

			//synchronization with server
			socket.on(SE.TIME_REQUEST, (timeRequestEvent: TimeRequestEvent) => {
				const serverCurrentLocalTime = Clock.now();
				socket.emit(CE.TIME_RESPONSE, <TimeResponseEvent>{
					clientCurrentLocalTime: timeRequestEvent.clientCurrentLocalTime,
					serverCurrentLocalTime: serverCurrentLocalTime,
				});
			});

			socket.on(ROOM_EVENT_NAMES.CREATE_ROOM, (roomSettings: RoomSettings) => {
				try {
					const usedRoomIds = this.roomRepo.getAllRooms().map((room: Room) => room.getId());
					const newRoom = RoomFactory.create(this.nsp, roomSettings.isPrivate, roomSettings.maxPlayerCount, roomSettings.createTime, usedRoomIds);
					const userId = newRoom.joinRoom(socket, userInfo, roomSettings.type);
					this.roomRepo.addRoom(newRoom);

					const roomId = newRoom.getId();
					this.handleDisconnection(socket, roomId, userId);
				} catch (err) {
					console.log(err);
					socket.error({
						type: 400,
						msg: err.message,
					});
				}
			});

			socket.on(ROOM_EVENT_NAMES.JOIN_ROOM_REQUEST, (joinRoomRequestEvent: JoinRoomRequestEvent) => {
				const roomId: string = joinRoomRequestEvent.roomId;
				try {
					const currentRoom = this.roomRepo.getRoomById(roomId);
					if (currentRoom == undefined) {
						throw new JoiningNonExistentRoomError();
					}
					const userId = currentRoom.joinRoom(socket, userInfo, "joinroom");
					this.handleDisconnection(socket, roomId, userId);
				} catch (error) {
					console.log(error);
					socket.emit(ROOM_EVENT_NAMES.JOIN_ROOM_ANSWER, <JoinRoomAnswerEvent>{ roomId: roomId, error: error });
				}
			});
		});
	}

	private deleteRoomIfEmpty(roomId: string): void {
		if (this.roomRepo.getRoomById(roomId).isRoomEmtpty()) {
			this.roomRepo.deleteRoomById(roomId);
		}
	}

	private removeUserFromRoom(roomId: string, userId: string) {
		const currentRoom = this.roomRepo.getRoomById(roomId);
		currentRoom.leaveRoom(userId);

		this.deleteRoomIfEmpty(roomId);
	}

	private handleDisconnection(socket: Socket, roomId: string, userId: string): void {
		socket.on("disconnect", () => {
			this.removeUserFromRoom(roomId, userId);
		});
	}
}
