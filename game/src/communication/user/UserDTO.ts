import UserInfo from "./UserInfo";

export interface UserDTO {
	userId: string;
	userInfo: UserInfo;
	isReady: boolean;
}
