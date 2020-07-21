import { getConnection, getRepository } from "typeorm";
import { Answer as GameAnswer } from "../../gameCore/race/Answer";
import { Question as GameQuestion } from "../../gameCore/race/Question";
import { Question as OrmQuestion } from "../../orm/entities/Question";
import QuestionRepository from "./QuestionRepository";

export default class QuestionDbRepository implements QuestionRepository {
	constructor() {}

	//TODO
	async getQuestionsForPlayer(playerLevel: number, difficulty: number): Promise<GameQuestion[]> {
		getRepository(OrmQuestion)
			.createQueryBuilder("question")
			.where("question.question_id = :id", { id: 1 })
			.getOne()
			.then((question) => {
				console.log("ORM query status : OK. ");
				console.log("query result : " + question.label);
			})
			.catch((error) => {
				console.log("ORM query status : ERROR. " + error);
				throw error;
			});
		return;
	}

	async getQuestionById(questionId: number, language: string): Promise<GameQuestion> {
		const queryString =
			"SELECT answer.label, answer.is_right, question_info.question_flash_file, question_info.feedback_flash_file, answer_type.tag" +
			" FROM question, answer, question_info, answer_type" +
			" WHERE answer.question_id = question.question_id" +
			" AND question_info.question_id = question.question_id" +
			" AND question.answer_type_id = answer_type.answer_type_id" +
			" AND question_info.language_id IN " +
			" (SELECT language_id " +
			" FROM `language`" +
			" WHERE `language`.short_name LIKE '" +
			language +
			"')" +
			" AND question.question_id = " +
			questionId +
			";";

		const rows = await getConnection().query(queryString);
		const gameAnswers: GameAnswer[] = rows.map((row) => new GameAnswer(row.label, row.is_right));
		//Information concerning the question can be fetched in any row. We take the first one (rows[0]).
		const gameQuestion: GameQuestion = new GameQuestion(gameAnswers, rows[0].tag, rows[0].question_flash_file, rows[0].feedback_flash_file);

		return gameQuestion;
	}
}
