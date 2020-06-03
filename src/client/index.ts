import "phaser";
import io from "socket.io-client";
import Game from "./game";

window.onload = () => {
	let game = new Game();

	let socket: SocketIOClient.Socket = io.connect("http://localhost:8080/");
	socket.emit("create-room", { roomType: "RaceRoom" });
	socket.on("room-created", () => {
		socket.emit("user-data-updated");
	});
	socket.on("room-left", () => {
		socket.emit("user-data-updated");
	});
};
