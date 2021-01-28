import UserInfo from "../../communication/user/UserInfo";

export default interface StatisticsRepository {
	addAnsweredQuestionStats(
		player: UserInfo,
		timeToAnswer: number,
		datetimeCreated: number,
		questionId: number,
		answerId?: number,
		answerText?: string
	): void;
	addEndGameStats(gameDuration: number, startPlayerCount: number, endPlayercount: number, datetimeCreated: Date, datetimeEnded: Date): void;
}
