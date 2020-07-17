import express from "express";
import { createServer } from "http";
import path from "path";
import socketIO from "socket.io";
import applyCommonContext, { serviceConstants } from "./context/CommonContext";
import ServiceLocator from "./context/ServiceLocator";
import GameManager from "./GameManager";
import RoomSelectionNamespace from "./namespace/RoomSelectionNamespace";
import RoomManager from "./rooms/RoomManager";
import { Server } from "./Server";

const app = express();
const httpServer = createServer(app);
const io = socketIO(httpServer);

// /static is used to define the root folder when webpack bundles
app.use("/static", express.static(path.join(__dirname, "../")));

//needed to intialize ServiceLocator
applyCommonContext();

//Namespaces for game modes and seperation of concerns
const roomManager: RoomManager = new RoomManager(io, ServiceLocator.resolve(serviceConstants.ROOM_REPOSITORY_CLASS));
const roomSelectionNamespace: RoomSelectionNamespace = new RoomSelectionNamespace(io, ServiceLocator.resolve(serviceConstants.ROOM_REPOSITORY_CLASS));
const gameManager: GameManager = new GameManager(ServiceLocator.resolve(serviceConstants.GAME_REPOSITORY_CLASS));

const server = new Server(app, httpServer);

server.listen((port) => {
	console.log(`Server is listening on http://localhost:${port}`);
});

// à voir le nom de la méthode si on prend update() directement
gameManager.startLoop();
