import io from "socket.io-client";
const CREATE_STRING = "create";
const JOIN_STRING = "join";

export const connectToRoomSelectionNamespace = (): SocketIOClient.Socket => {
	const socket = io.connect("http://localhost:8080/roomSelection");
	return socket;
};

export const connectToGameNamespace = (): SocketIOClient.Socket => {
	const socket = io.connect("http://localhost:8080/game");
	return socket;
};

export const createRoom = (socket: SocketIOClient.Socket, gameType: string) => {
	socket.emit("create-game", { gameType });
};

export const joinRoom = (socket: SocketIOClient.Socket, roomId: string) => {
	socket.emit("join-game", { roomId: roomId });
};

//À vérifier si c'est plus clean de faire un handshake avec des données non utilisées. 2020-06-10

// export const createRoom = (gameType: string): SocketIOClient.Socket => {
// 	const socket = io.connect("http://localhost:8080/game", {
// 		query: {
// 			request: "create",
// 			roomId: "",
// 			gameType,
// 		},
// 	});

// 	return socket;
// };

// export const joinRoom = (roomId: string): SocketIOClient.Socket => {
// 	const socket = io.connect("http://localhost:8080/game", {
// 		query: {
// 			request: "join",
// 			roomId,
// 			gameType: "",
// 		},
// 	});

// 	return socket;
// };
