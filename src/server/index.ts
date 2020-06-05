import express from "express";
import path from "path";
import { Server } from "./server";

const app = express();

// /static is used to define the root folder when webpack bundles
app.use("/static", express.static(path.join(__dirname, "../")));

const server = new Server(app);

server.listen((port) => {
	console.log(`Server is listening on http://localhost:${port}`);
});

server.updateTest();
