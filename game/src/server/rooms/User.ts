import UserInfo from "../../communication/user/UserInfo";

export default interface User {
	isReady: boolean;
	userId: string;
	userInfo: UserInfo;
	socket: SocketIO.Socket;
}
