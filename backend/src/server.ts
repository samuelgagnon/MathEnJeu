import express, { Application } from "express";
import socketIO, { Server as SocketIOServer } from "socket.io";
import { createServer, Server as HTTPServer } from "http";

export class Server {
  private httpServer: HTTPServer;
  private app: Application;
  private io: SocketIOServer;
  private activeSockets: string[] = [];

  private readonly DEFAULT_PORT = 5000;

  constructor() {
    this.initialize();

    this.handleRoutes();
    this.handleSocketConnection();
  }

  private initialize(): void {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = socketIO(this.httpServer);
  }

  private handleRoutes(): void {
    this.app.get("/", (req, res) => {
      res.sendFile(__dirname + "/index.html");
    });
  }

  private handleSocketConnection(): void {
    this.io.on("connection", (socket) => {
      console.log("connection");
      const existingSocket = this.activeSockets.find(
        (existingSocket) => existingSocket === socket.id
      );

      if (!existingSocket) {
        this.activeSockets.push(socket.id);

        socket.emit("update-user-list", {
          users: this.activeSockets.filter(
            (existingSocket) => existingSocket !== socket.id
          ),
        });
      }

      socket.on("disconnect", () => {
        console.log("Disconnection");
        this.activeSockets = this.activeSockets.filter(
          (existingSocket) => existingSocket !== socket.id
        );
      });
    });
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.DEFAULT_PORT, () =>
      callback(this.DEFAULT_PORT)
    );
  }
}
