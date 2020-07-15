import express from "express";
import { createServer } from "http";
import path from "path";
import socketIO from "socket.io";
import applyCommonContext, { serviceConstants } from "./context/commonContext";
import ServiceLocator from "./context/serviceLocator";
import GameManager from "./gameManager";
import RoomSelectionNamespace from "./namespace/roomSelectionNamespace";
import RoomManager from "./rooms/roomManager";
import { Server } from "./server";

const app = express();
const httpServer = createServer(app);
const io = socketIO(httpServer);

//test DB
//const db = new DataBaseHandler("172.18.0.2", "root", "123", "mathamaze2", 3306);
//const db = new DataBaseHandler("127.0.0.1", "root", "123", "mathamaze2", 3306);
//db.getFirstQuestion();

let mysql = require("mysql");

let dbconfig = {
	host: "db",
	user: "user",
	password: "123",
	database: "mathamaze2",
	port: "3306",
};

let con = mysql.createConnection(dbconfig);

let nbTry = 0;
dbconnect(con, dbconfig, nbTry);
function dbconnect(con, dbconfig, nbTry): void {
	con.connect(function (err) {
		nbTry++;
		console.log("DB_CONNECT:#" + nbTry);
		if (err) {
			console.error("Error connecting: " + err.stack);
			if (nbTry < 20) {
				con = mysql.createConnection(dbconfig);
				setTimeout(function () {
					dbconnect(con, dbconfig, nbTry);
				}, 60000);
			} else {
				console.log("Max number of tries reached.");
			}
		} else {
			console.log("Connected!");
		}
	});
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
