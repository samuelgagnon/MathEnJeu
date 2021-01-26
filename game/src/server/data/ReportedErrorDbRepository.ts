import { getConnection } from "typeorm";
import ReportedErrorRepository from "./ReportedErrorRepository";

export default class ReportedErrorDbRepository implements ReportedErrorRepository {
	constructor() {}

	addReportedError(languageShortName: string, errorDescription: string, errorLog?: string, username?: string, questionId?: number): void {
		const questionIdString = questionId === undefined ? "NULL" : String(questionId);
		const usernameString = username === undefined ? "NULL" : `'${username}'`;
		const errorLogString = errorLog === undefined ? "NULL" : `'${errorLog}'`;
		const queryString = `INSERT INTO reported_error ( language_id, description, question_id, username, app_error_log)
		VALUES ((SELECT language_id
			FROM \`language\`
			WHERE \`language\`.short_name LIKE '${languageShortName}'), 
            '${errorDescription}',
            ${questionIdString},
            ${usernameString},
            ${errorLogString});`;

		getConnection().query(queryString);
	}
}
