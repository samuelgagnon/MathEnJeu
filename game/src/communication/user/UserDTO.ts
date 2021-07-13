import Character from "../../gameCore/race/character/Character";
import UserInfo from "./UserInfo";

export interface UserDTO {
	userId: string;
	userInfo: UserInfo;
	isReady: boolean;
	character: Character;
}
