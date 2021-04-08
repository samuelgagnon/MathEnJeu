import { Server as SocketIOServer, Socket } from "socket.io";
import { ROOM_SELECTION_EVENT_NAMES } from "../../communication/roomSelection/EventNames";
import RoomRepository from "../data/RoomRepository";
import Room from "../rooms/Room";

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
			this.nsp.emit(ROOM_SELECTION_EVENT_NAMES.ROOM_UPDATE, this.getRoomsInfo());

			this.sendRoomsToClient(socket);

			socket.on(ROOM_SELECTION_EVENT_NAMES.UPDATE_REQUEST, () => {
				socket.emit(ROOM_SELECTION_EVENT_NAMES.ROOM_UPDATE, this.getRoomsInfo());
			});
		});
	}

	private sendRoomsToClient(socket: Socket) {
		setTimeout(() => {
			socket.emit(ROOM_SELECTION_EVENT_NAMES.ROOM_UPDATE, this.getRoomsInfo());
			this.sendRoomsToClient(socket);
		}, this.ROOM_UPDATE_TIME_INTERVAL);
	}

	private getRoomsInfo(): string[] {
		return this.roomRepo
			.getAllRooms()
			.filter((room: Room) => !room.getIsPrivate())
			.map((room) => `Id: ${room.getId()} - Currently in: ${room.getGameState()}`);
	}
}
