import { Application } from "express";
import { Server as HTTPServer } from "http";
import path from "path";
import { Server as SocketIOServer, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import RoomRepository from "./data/roomRepository";
import RoomFactory from "./rooms/roomFactory";
import RoomInterface from "./rooms/roomInterface";
import RoomType from "./rooms/roomType";

export class Server {
	private httpServer: HTTPServer;
	private app: Application;
	private io: SocketIOServer;
	private rooms = new Map<string, RoomInterface>();
	private updateLoopTimestep: number = 45;
	private roomRepo: RoomRepository;

	private readonly DEFAULT_PORT = 8080;

	constructor(app: Application, httpServer: HTTPServer, io: SocketIOServer, roomRepo: RoomRepository) {
		this.app = app;
		this.httpServer = httpServer;
		this.io = io;
		this.roomRepo = roomRepo;

		this.handleRoutes();
		this.handleSocketEvents();
	}

	private handleRoutes(): void {
		this.app.get("/", (req, res) => {
			res.sendFile(path.join(__dirname, "../", "/client/index.html"));
		});
	}

	private handleSocketEvents(): void {
		this.io.of("/classic").on("connection", (socket) => {
			console.log("connection");

			socket.on("join-room", (request) => {
				this.rooms.get(request.roomId).joinRoom(socket);
			});
			socket.on("create-room", (request) => {
				let newRoom = this.createRoom(RoomType[request.roomType]);
				this.rooms.set(newRoom.getRoomId(), newRoom);
				newRoom.joinRoom(socket);
			});
			socket.on("disconnect", () => {
				console.log("Disconnection");
				console.log(socket.rooms);
				if (Object.getOwnPropertyNames(socket.rooms).length > 0) {
					this.removeUserFromRoom("", socket);
					socket.leaveAll();
					console.log(socket.rooms);
				}
			});
		});
	}

	public listen(callback: (port: number) => void): void {
		this.httpServer.listen(this.DEFAULT_PORT, () => callback(this.DEFAULT_PORT));
	}

	private createRoom(roomType: RoomType): RoomInterface {
		const roomId: string = uuidv4();
		let newRoom: RoomInterface = RoomFactory.create(roomType, roomId, this.io);
		return newRoom;
	}

	private removeUserFromRoom(roomdId: string, clientSocket: Socket): void {
		const room = this.rooms.get(roomdId);
		room.leaveRoom(clientSocket);
		if (room.isRoomEmtpty()) {
			this.rooms.delete(roomdId);
		}
	}

	public updateTest() {
		setTimeout(() => {
			this.io.emit("update");
			this.updateTest();
		}, this.updateLoopTimestep);
	}
}
