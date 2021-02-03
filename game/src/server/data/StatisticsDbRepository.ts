import { getConnection } from "typeorm";
import UserInfo from "../../communication/user/UserInfo";
import InsertOrUpdateDbResponse from "./InsertOrUpdateDbResponse";
import StatisticsRepository from "./StatisticsRepository";

export default class StatisticsDbRepository implements StatisticsRepository {
	readonly PLAYED_GAME_TABLE_NAME = `played_game`;
	readonly GIVEN_ANSWER_TABLE_NAME = `given_answer`;

	private getMySqlDatetimeFromDate(d: Date): string {
		return d.toISOString().split("T")[0] + " " + d.toTimeString().split(" ")[0];
	}

	constructor() {}

	async addAnsweredQuestionStats(
		gameId: number,
		player: UserInfo,
		questionPromptTime: Date,
		timeWhenAnswered: Date,
		questionId: number,
		answerText?: string,
		answerId?: number
	): Promise<void> {
		const answerTextString = answerText === undefined ? "NULL" : `'${answerText}'`;
		const answerIdString = answerId === undefined ? "NULL" : String(answerId);
		const playerNameString = `'${player.name}'`;
		const questionPromptTimeString = `'${this.getMySqlDatetimeFromDate(questionPromptTime)}'`;
		const timeWhenAnsweredString = `'${this.getMySqlDatetimeFromDate(timeWhenAnswered)}'`;
		const queryString = `INSERT INTO ${this.GIVEN_ANSWER_TABLE_NAME} ( question_id, language_id, level_id, played_game_id, answer_id, answer_text, username, question_prompt_time, answer_time)
		VALUES (${questionId},
			(SELECT language_id
			FROM \`language\`
			WHERE \`language\`.short_name LIKE '${player.language}'),
			${player.schoolGrade},
			${gameId},
			${answerIdString},
			${answerTextString},
			${playerNameString},
			${questionPromptTimeString},
			${timeWhenAnsweredString});`;

		const response = await getConnection().query(queryString);

		this.logQueryResponse("addAnsweredQuestionStats", response);
	}

	async addGameStats(gameDuration: number, gameType: string, startPlayerCount: number, datetimeCreated: Date): Promise<number> {
		const datetimeCreatedString = this.getMySqlDatetimeFromDate(datetimeCreated);
		const queryString = `INSERT INTO ${this.PLAYED_GAME_TABLE_NAME} (game_planned_duration, game_type, start_player_count, datetime_created)
		VALUES (${gameDuration}, '${gameType}', ${startPlayerCount}, '${datetimeCreatedString}');`;

		const response = await getConnection().query(queryString);

		this.logQueryResponse("addGameStats", response);

		return response.insertId;
	}

	async updateEndGameStats(gameId: number, endPlayercount: number, datetimeEnded: Date): Promise<void> {
		const datetimeEndedString = `'${this.getMySqlDatetimeFromDate(datetimeEnded)}'`;
		const queryString = `UPDATE ${this.PLAYED_GAME_TABLE_NAME} 
		SET end_player_count = ${endPlayercount}, datetime_ended = ${datetimeEndedString}
		WHERE played_game_id = ${gameId}`;

		const response = await getConnection().query(queryString);
		this.logQueryResponse("updateEndGameStats", response);
	}

	private logQueryResponse(operationName: string, response: InsertOrUpdateDbResponse) {
		if (response.affectedRows != 1) {
			console.log(`Error: ${response.affectedRows} rows affected by ${operationName}. Details : ${JSON.stringify(response)}`);
		}
	}
}
