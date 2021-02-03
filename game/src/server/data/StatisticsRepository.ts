import UserInfo from "../../communication/user/UserInfo";

export default interface StatisticsRepository {
	addAnsweredQuestionStats(
		gameId: number,
		player: UserInfo,
		questionPromptTime: Date,
		timeWhenAnswered: Date,
		questionId: number,
		answerText?: string,
		answerId?: number
	): Promise<void>;
	/**
	 * Returns the created game stats id.
	 * @param gameDuration Duration of the game (in milliseconds) as planned before starting the game
	 */
	addGameStats(gameDuration: number, gameType: string, startPlayerCount: number, datetimeCreated: Date): Promise<number>;
	/**
	 *
	 * @param datetimeEnded Time when the game ends (whether it corresponds to the duration or not)
	 */
	updateEndGameStats(gameId: number, endPlayercount: number, datetimeEnded: Date): Promise<void>;
}
