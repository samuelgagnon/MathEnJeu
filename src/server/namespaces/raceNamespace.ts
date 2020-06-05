import { Server as SocketIOServer, Socket } from "socket.io";
import RoomRepository from "../data/roomRepository";

export default class RaceNamespace {
	private io: SocketIOServer;
	private roomRepo: RoomRepository;
	private readonly namespace: string = "/race";
	private nsp;

	constructor(ioServer: SocketIOServer, roomRepo: RoomRepository) {
		this.io = ioServer;
		this.roomRepo = roomRepo;
		//this.nsp = this.io.of(this.namespace);
		this.handleSocketEvents();
	}

	private handleSocketEvents(): void {
		this.roomRepo.addRoom({ roomId: "ast", users: ["sup"] });
		const nsp = this.io.of("/race");
		nsp.on("connection", (socket: Socket) => {
			console.log("connection on race");

			socket.on("disconnect", () => {
				console.log("disconnection");
			});
		});
	}
}
