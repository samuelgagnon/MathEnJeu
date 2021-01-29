import UserInfo from "../../communication/user/UserInfo";

export default interface StatisticsRepository {
	addAnsweredQuestionStats(
		gameId: number,
		player: UserInfo,
		timeWhenAnswered: Date,
		questionPromptTime: Date,
		questionId: number,
		answerText?: string,
		answerId?: number
	): void;
	addGameStats(gameDuration: number, gameType: string, startPlayerCount: number, datetimeCreated: Date): Promise<number>;
	updateEndGameStats(gameId: number, endPlayercount: number, datetimeEnded: Date): void;
}
