import { UserDTO } from "../../communication/user/UserDTO";
import UserInfo from "../../communication/user/UserInfo";

export default interface User {
	isReady: boolean;
	userId: string;
	userInfo: UserInfo;
	socket: SocketIO.Socket;
}

export const UserToDTO = (user: User): UserDTO => {
	return { userId: user.userId, userInfo: user.userInfo, isReady: user.isReady };
};
