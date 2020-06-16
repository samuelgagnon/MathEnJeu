import express from "express";
import { createServer } from "http";
import path from "path";
import socketIO from "socket.io";
import RoomRepository from "./data/roomRepository";
import RoomInMemoryRepository from "./data/roomsInMemoryRepository";
import RoomManager from "./rooms/roomManager";
import RoomSelectionNamespace from "./namespace/roomSelectionNamespace";
import { Server } from "./server";
import GameManager from "./gameManager";
import GameInMemoryRepository from "./data/gameInMemoryRepository";
import GameRepository from "./data/gameRepository";

const app = express();
const httpServer = createServer(app);
const io = socketIO(httpServer);

// /static is used to define the root folder when webpack bundles
app.use("/static", express.static(path.join(__dirname, "../")));

const roomRepo: RoomRepository = new RoomInMemoryRepository();
const gameRepo: GameRepository = new GameInMemoryRepository();

//Namespaces for game modes and seperation of concerns
const roomManager: RoomManager = new RoomManager(io, roomRepo);
const roomSelectionNamespace: RoomSelectionNamespace = new RoomSelectionNamespace(io, roomRepo);
const gameManager: GameManager = new GameManager(gameRepo);

const server = new Server(app, httpServer);

server.listen((port) => {
	console.log(`Server is listening on http://localhost:${port}`);
});

// à voir le nom de la méthode si on prend update() directement
gameManager.startLoop();
