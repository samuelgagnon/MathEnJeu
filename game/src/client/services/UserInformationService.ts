import UserInfo from "../../communication/userInfo";

export const setUserInfo = (userInfo: UserInfo): void => {
	localStorage.setItem("userInfo", JSON.stringify(userInfo));
};

export const getUserInfo = (): UserInfo => {
	return <UserInfo>JSON.parse(localStorage.getItem("userInfo"));
};
