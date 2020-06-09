import { Application } from "express";
import { Server as HTTPServer } from "http";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import RoomRepository from "./data/roomRepository";
import Room from "./rooms/room";

export class Server {
	private httpServer: HTTPServer;
	private app: Application;
	private io: SocketIOServer;
	private rooms = new Map<string, Room>();
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

		this.app.get("rooms", (req, res) => {
			res.send(this.roomRepo.getAllRooms());
		});
	}

	private handleSocketEvents(): void {
		this.io.on("connection", (socket) => {
			console.log("connection");

			socket.on("disconnect", () => {
				console.log("Disconnection");
			});
		});
	}

	public listen(callback: (port: number) => void): void {
		this.httpServer.listen(this.DEFAULT_PORT, () => callback(this.DEFAULT_PORT));
	}

	public updateTest() {
		setTimeout(() => {
			this.io.emit("update");
			this.updateTest();
		}, this.updateLoopTimestep);
	}
}
