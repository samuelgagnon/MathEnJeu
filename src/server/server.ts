import { Application } from "express";
import { createServer, Server as HTTPServer } from "http";
import path from "path";
import socketIO, { Server as SocketIOServer, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import Room from "./rooms/room";
import RoomFactory from "./rooms/roomFactory";
import RoomType from "./rooms/roomType";

export class Server {
	private httpServer: HTTPServer;
	private app: Application;
	private io: SocketIOServer;
	private rooms = new Map<string, Room>();

	private readonly DEFAULT_PORT = 8080;

	constructor(app: Application) {
		this.initialize(app);

		this.handleRoutes();
		this.handleSocketEvents();
	}

	private initialize(app: Application): void {
		this.app = app;
		this.httpServer = createServer(this.app);
		this.io = socketIO(this.httpServer);
	}

	private handleRoutes(): void {
		this.app.get("/", (req, res) => {
			res.sendFile(path.join(__dirname, "../", "/client/index.html"));
		});
	}

	private handleSocketEvents(): void {
		this.io.on("connection", (socket) => {
			console.log("connection");
			socket.on("user-data-updated", () => {
				console.log("server class pinged");
			});

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

	private createRoom(roomType: RoomType): Room {
		const roomId: string = uuidv4();
		let newRoom: Room = RoomFactory.create(roomType, roomId, this.io);
		return newRoom;
	}

	private removeUserFromRoom(roomdId: string, clientSocket: Socket): void {
		const room = this.rooms.get(roomdId);
		room.leaveRoom(clientSocket);
		if (room.isRoomEmtpty()) {
			this.rooms.delete(roomdId);
		}
	}
}
