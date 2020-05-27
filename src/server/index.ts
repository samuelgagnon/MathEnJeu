import { Server } from "./server";
import express, { Application } from "express";
import path from "path";

const app = express();

// /static is used to define the root folder when webpack bundles
app.use("/static", express.static(path.join(__dirname, "../")));

const server = new Server(app);

server.listen((port) => {
  console.log(`Server is listening on http://localhost:${port}`);
});
