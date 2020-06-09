import io from "socket.io-client";

export const pingServerRace = (): SocketIOClient.Socket => {
	const socket = io.connect("http://localhost:8080/race");
	return socket;
};

export const createRoom = (gameType: string): SocketIOClient.Socket => {
	const socket = io.connect("http://localhost:8080/game", {
		query: {
			request: "create",
			roomId: "",
			gameType,
		},
	});

	return socket;
};

export const joinRoom = (roomId: string): SocketIOClient.Socket => {
	const socket = io.connect("http://localhost:8080/game", {
		query: {
			request: "join",
			roomId,
			gameType: "",
		},
	});

	return socket;
};
