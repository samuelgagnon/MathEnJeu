import express from "express";
import { createServer } from "http";
import path from "path";
import "reflect-metadata";
import socketIO from "socket.io";
import DatabaseHandler from "../orm/DatabaseHandler";
import applyCommonContext, { serviceConstants } from "./context/commonContext";
import ServiceLocator from "./context/serviceLocator";
import GameManager from "./gameManager";
import RoomSelectionNamespace from "./namespace/roomSelectionNamespace";
import RoomManager from "./rooms/roomManager";
import { Server } from "./server";

const app = express();
const httpServer = createServer(app);
const io = socketIO(httpServer);

const db = new DatabaseHandler("db", "user", "123", "mathamaze2", 3306);

try {
	let myQuestion = db.getFirstQuestion();
	console.log("Index OK : " + myQuestion.label);
} catch (error) {
	console.log("Index ERROR : " + error);
}

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
