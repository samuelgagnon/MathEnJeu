export default interface User {
	userId: string;
	name: string;
	socket: SocketIO.Socket;
}
