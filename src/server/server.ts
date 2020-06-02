import { Application } from "express";
import { createServer, Server as HTTPServer } from "http";
import path from "path";
import socketIO, { Server as SocketIOServer } from "socket.io";
import Room from "./rooms/room";
import RoomFactory from "./rooms/roomFactory";

export class Server {
	private httpServer: HTTPServer;
	private app: Application;
	private io: SocketIOServer;
	private activeSockets: string[] = [];
	private rooms: Room[] = [];

	private readonly DEFAULT_PORT = 8080;

	constructor(app: Application) {
		this.initialize(app);

		this.handleRoutes();
		this.handleSocketConnection();
	}

	private createRoom(roomType: RoomType, socketId: string): void {
		let newRoom: Room = RoomFactory.create(roomType, socketId, this.io);
		this.rooms.push(newRoom);
	}

	private initialize(app: Application): void {
		this.app = app;
		this.httpServer = createServer(this.app);
		this.io = socketIO(this.httpServer);
	}

	private handleRoutes(): void {
		this.app.get("/", (req, res) => {
			res.sendFile(path.join(__dirname, "../", "/client/index.html"));
			//res.send({ object: "test" });
		});
	}

	private handleSocketConnection(): void {
		this.io.on("connection", (socket) => {
			console.log("connection");
			const existingSocket = this.activeSockets.find((existingSocket) => existingSocket === socket.id);

			if (!existingSocket) {
				this.activeSockets.push(socket.id);
			}

			socket.on("createRoom", (request) => {
				this.createRoom(request.roomType, socket.id);
			});

			socket.on("disconnect", () => {
				console.log("Disconnection");
				this.activeSockets = this.activeSockets.filter((existingSocket) => existingSocket !== socket.id);
			});
		});
	}

	public listen(callback: (port: number) => void): void {
		this.httpServer.listen(this.DEFAULT_PORT, () => callback(this.DEFAULT_PORT));
	}

	private handleChatEvents() {}
}
