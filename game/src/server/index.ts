import express from "express";
import { createServer } from "http";
import path from "path";
import "reflect-metadata";
import socketIO from "socket.io";
import { createConnection } from "typeorm";
import { Answer } from "../orm/entities/Answer";
import { AnswerInfo } from "../orm/entities/AnswerInfo";
import { AnswerType } from "../orm/entities/AnswerType";
import { AnswerTypeInfo } from "../orm/entities/AnswerTypeInfo";
import { Language } from "../orm/entities/Language";
import { LanguageInfo } from "../orm/entities/LanguageInfo";
import { Question } from "../orm/entities/Question";
import { QuestionInfo } from "../orm/entities/QuestionInfo";
import applyCommonContext, { serviceConstants } from "./context/CommonContext";
import ServiceLocator from "./context/ServiceLocator";
import GameManager from "./GameManager";
import RoomManager from "./rooms/RoomManager";
import RoomSelectionNamespace from "./roomSelection/RoomSelectionNamespace";
import { Server } from "./Server";

const app = express();
const httpServer = createServer(app);
const io = socketIO(httpServer);

//Connection for typeORM. The database doesn't need to be online for this connection to work.
createConnection({
	type: "mysql",
	host: "db",
	port: 3306,
	username: "user",
	password: "123",
	database: "mathamaze2",
	entities: [Question, Answer, AnswerInfo, QuestionInfo, Language, LanguageInfo, AnswerType, AnswerTypeInfo],
	synchronize: true,
});

app.use("/static", express.static(path.join(__dirname, "../")));

//needed to intialize ServiceLocator
applyCommonContext();

//Namespaces for game modes and seperation of concerns
const roomManager: RoomManager = new RoomManager(io, ServiceLocator.resolve(serviceConstants.ROOM_REPOSITORY_CLASS));
const roomSelectionNamespace: RoomSelectionNamespace = new RoomSelectionNamespace(io, ServiceLocator.resolve(serviceConstants.ROOM_REPOSITORY_CLASS));
const gameManager: GameManager = new GameManager(ServiceLocator.resolve(serviceConstants.GAME_REPOSITORY_CLASS));

const server = new Server(app, httpServer, ServiceLocator.resolve(serviceConstants.QUESTION_REPOSITORY_CLASS));

server.listen((port) => {
	console.log(`Server is listening on http://localhost:${port}`);
});

// à voir le nom de la méthode si on prend update() directement
gameManager.startLoop();
