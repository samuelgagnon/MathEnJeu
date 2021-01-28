import UserInfo from "../../communication/user/UserInfo";
import StatisticsRepository from "./StatisticsRepository";

export default class StatisticsDbRepository implements StatisticsRepository {
	constructor() {}
	addAnsweredQuestionStats(
		player: UserInfo,
		timeToAnswer: number,
		datetimeCreated: number,
		questionId: number,
		answerId?: number,
		answerText?: string
	): void {
		return;
	}

	addEndGameStats(gameDuration: number, startPlayerCount: number, endPlayercount: number, datetimeCreated: Date, datetimeEnded: Date): void {
		return;
	}
}
