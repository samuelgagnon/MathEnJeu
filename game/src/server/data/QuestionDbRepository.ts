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
		const gameQuestion: GameQuestion = new GameQuestion(gameAnswers, rows[0].question_flash_file);

		//TODO : Really use ORM instead of executing raw SQL as below.
		/*
		const ormQuestion = await getConnection()
			.getRepository(OrmQuestion)
			.createQueryBuilder("question")
			.leftJoinAndSelect("question.answers", "answer")
			.leftJoinAndSelect("question.questionInfo", "questioninfo")
			.where("question.question_id = :id", { id: questionId })
			.andWhere((qb) => {
				const subQuery = qb
					.subQuery()
					.select("language.language_id")
					.from(Language, "language")
					.where("language.short_name LIKE :short_name", { short_name: language })
					.getQuery();
				return "questioninfo.language_id IN " + subQuery;
			})
			.getOne();

		console.log(`ORM Query result: ${ormQuestion}`);

		const gameAnswers: GameAnswer[] = ormQuestion.answers.map((ormAnswer) => new GameAnswer(ormAnswer.label, ormAnswer.isRight));

		//questionInfos array contains only one element corresponding to the selected language
		const gameQuestion = new GameQuestion(gameAnswers, ormQuestion.questionInfos[0].questionFlashFile);*/

		return gameQuestion;
	}
}
