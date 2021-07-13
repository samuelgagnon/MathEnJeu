import { UserDTO } from "../../communication/user/UserDTO";
import UserInfo from "../../communication/user/UserInfo";
import Character from "../../gameCore/race/character/Character";

export default interface User {
	isReady: boolean;
	userId: string;
	userInfo: UserInfo;
	socket: SocketIO.Socket;
	character: Character;
}

export const UserToDTO = (user: User): UserDTO => {
	return { userId: user.userId, userInfo: user.userInfo, isReady: user.isReady, characterDTO: user.character.getCharacterDTO() };
};
