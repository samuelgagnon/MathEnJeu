import { Server as SocketIOServer, Socket } from "socket.io";
import RoomRepository from "../data/roomRepository";

export default class RoomSelectionNamespace {
	private io: SocketIOServer;
	private roomRepo: RoomRepository;
	private nsp: SocketIO.Namespace;
	private readonly namespace: string = "/roomSelection";
	private readonly ROOM_UPDATE_TIME_INTERVAL = 10000;

	constructor(ioServer: SocketIOServer, roomRepo: RoomRepository) {
		this.io = ioServer;
		this.roomRepo = roomRepo;
		this.nsp = this.io.of(this.namespace);
		this.handleSocketEvents();
	}

	private handleSocketEvents(): void {
		this.nsp.on("connection", (socket: Socket) => {
			//console.log("connection on room selection");

			socket.emit(
				"room-update",
				this.roomRepo.getAllRooms().map((room) => room.getRoomId())
			);

			// socket.on("disconnect", () => {
			// 	console.log("room selection disconnection");
			// });

			this.sendRoomsToClient(socket);
		});
	}

	private sendRoomsToClient(socket: Socket) {
		setTimeout(() => {
			console.log(this.roomRepo.getAllRooms().map((room) => room.getRoomId()));
			socket.emit(
				"room-update",
				this.roomRepo.getAllRooms().map((room) => room.getRoomId())
			);
			this.sendRoomsToClient(socket);
		}, this.ROOM_UPDATE_TIME_INTERVAL);
	}
}
