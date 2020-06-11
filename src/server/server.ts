import { Application } from "express";
import { Server as HTTPServer } from "http";
import path from "path";

export class Server {
	private httpServer: HTTPServer;
	private app: Application;

	private readonly DEFAULT_PORT = 8080;

	constructor(app: Application, httpServer: HTTPServer) {
		this.app = app;
		this.httpServer = httpServer;

		this.handleRoutes();
	}

	private handleRoutes(): void {
		this.app.get("/", (req, res) => {
			res.sendFile(path.join(__dirname, "../", "/client/index.html"));
		});
	}

	public listen(callback: (port: number) => void): void {
		this.httpServer.listen(this.DEFAULT_PORT, () => callback(this.DEFAULT_PORT));
	}
}
