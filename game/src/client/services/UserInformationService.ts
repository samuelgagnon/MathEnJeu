import UserInfo from "../../communication/UserInfo";
import UserStats from "../../communication/UserStats";

export const setUserInfo = (userInfo: UserInfo): void => {
	localStorage.setItem("userInfo", JSON.stringify(userInfo));
};

export const getUserInfo = (): UserInfo => {
	return <UserInfo>JSON.parse(localStorage.getItem("userInfo"));
};

export const getUserHighScore = (): number => {
	const stats = <UserStats>JSON.parse(localStorage.getItem("userStats"));
	return stats != null && stats != undefined ? stats.highScore : 0;
};

export const updateUserHighScore = (score: number): void => {
	const currentHighScore = (<UserStats>JSON.parse(localStorage.getItem("userStats"))).highScore;
	if (score > currentHighScore) {
		localStorage.setItem("userStats", JSON.stringify(<UserStats>{ highScore: score }));
	}
};

export const initializeUserStats = (): void => {
	const stats = <UserStats>JSON.parse(localStorage.getItem("userStats"));
	if (stats == null || stats == undefined) {
		localStorage.setItem("userStats", JSON.stringify(<UserStats>{ highScore: 0 }));
	}
};
