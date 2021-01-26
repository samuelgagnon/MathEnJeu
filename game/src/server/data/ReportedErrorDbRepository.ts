import { getConnection } from "typeorm";
import ReportedErrorRepository from "./ReportedErrorRepository";

export default class ReportedErrorDbRepository implements ReportedErrorRepository {
	constructor() {}

	addReportedError(languageShortName: string, errorDescription: string, questionId?: number, username?: string): void {
		const questionId_string = questionId === undefined ? "NULL" : String(questionId);
		const username_string = username === undefined ? "NULL" : `'${username}'`;
		const queryString = `INSERT INTO reported_error ( language_id, description, question_id, username)
		VALUES ((SELECT language_id
			FROM \`language\`
			WHERE \`language\`.short_name LIKE '${languageShortName}'), 
            '${errorDescription}',
            ${questionId_string},
			${username_string});`;

		getConnection().query(queryString);
	}
}
