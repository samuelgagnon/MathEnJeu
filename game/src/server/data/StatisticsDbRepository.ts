import { getConnection } from "typeorm";
import UserInfo from "../../communication/user/UserInfo";
import StatisticsRepository from "./StatisticsRepository";

export default class StatisticsDbRepository implements StatisticsRepository {
	readonly PLAYED_GAME_TABLE_NAME = `played_game`;
	readonly GIVEN_ANSWER_TABLE_NAME = `given_answer`;

	constructor() {}
	addAnsweredQuestionStats(
		gameId: number,
		player: UserInfo,
		timeWhenAnswered: Date,
		datetimeCreated: Date,
		questionId: number,
		answerText?: string,
		answerId?: number
	): void {
		return;
	}

	private getMySqlDatetimeFromDate(d: Date): string {
		return d.toISOString().split("T")[0] + " " + d.toTimeString().split(" ")[0];
	}

	async addGameStats(gameDuration: number, gameType: string, startPlayerCount: number, datetimeCreated: Date): Promise<number> {
		const datetimeCreatedString = this.getMySqlDatetimeFromDate(datetimeCreated);
		const queryString = `INSERT INTO ${this.PLAYED_GAME_TABLE_NAME} (game_planned_duration, game_type, start_player_count, datetime_created)
		VALUES (${gameDuration}, '${gameType}', ${startPlayerCount}, '${datetimeCreatedString}');
		SELECT LAST_INSERT_ID() AS game_id;`;

		const rows = await getConnection().query(queryString);

		if (rows.length == 0) {
			throw Error(`Error while selecting last inserted ID of ${this.PLAYED_GAME_TABLE_NAME}. No result found.`);
		}

		//There should be only one returned row, that's why we're chosing the first one.
		return rows[0].game_id;
	}

	updateEndGameStats(gameId: number, endPlayercount: number, datetimeEnded: Date): void {
		return;
	}
}
