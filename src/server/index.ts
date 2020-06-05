import express from "express";
import { createServer } from "http";
import path from "path";
import socketIO from "socket.io";
import RoomRepository from "./data/roomRepository";
import RoomInMemoryRepository from "./data/roomsInMemoryRepository";
import RaceNamespace from "./namespaces/raceNamespace";
import { Server } from "./server";

const app = express();
const httpServer = createServer(app);
const io = socketIO(httpServer);

// /static is used to define the root folder when webpack bundles
app.use("/static", express.static(path.join(__dirname, "../")));

const roomRepo: RoomRepository = new RoomInMemoryRepository();
const raceNamespace: RaceNamespace = new RaceNamespace(io, roomRepo);

const server = new Server(app, httpServer, io, roomRepo);

server.listen((port) => {
	console.log(`Server is listening on http://localhost:${port}`);
});
