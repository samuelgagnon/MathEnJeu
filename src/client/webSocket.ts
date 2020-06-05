import io from "socket.io-client";

export class WebSocketSingleton {
	private static socket: SocketIOClient.Socket;

	public static getInstance(): SocketIOClient.Socket {
		if (this.socket == null) {
			this.socket = io.connect("http://localhost:8080/");
		}
		return this.socket;
	}
}
