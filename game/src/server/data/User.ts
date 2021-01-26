import UserInfo from "../../communication/UserInfo";

export default interface User {
	userId: string;
	userInfo: UserInfo;
	socket: SocketIO.Socket;
	schoolGrade: number;
	language: string;
}
