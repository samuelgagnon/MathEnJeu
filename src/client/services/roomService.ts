import io from "socket.io-client";

export const pingServerRace = (): SocketIOClient.Socket => {
	const socket = io.connect("http://localhost:8080/race");
	return socket;
};

export const joinRoom = (roomId: string, userName: string, gameType: string): SocketIOClient.Socket => {
	const socket = io.connect(`${process.env.GAME_APP_API_URL}/${gameType}`, {
		query: {
			roomId,
			userName,
		},
	});
	return socket;
};
