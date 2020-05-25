import { Server } from "./server/server";
import express, { Application } from "express";

const app = express();
app.use(express.static(__dirname + "/client"));

const server = new Server(app);

server.listen((port) => {
  console.log(`Server is listening on http://localhost:${port}`);
});
