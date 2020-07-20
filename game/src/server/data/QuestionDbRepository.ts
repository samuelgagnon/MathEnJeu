import { getConnection, getRepository } from "typeorm";
import { Answer as GameAnswer } from "../../gameCore/race/Answer";
import { Question as GameQuestion } from "../../gameCore/race/Question";
import { Question as OrmQuestion } from "../../orm/entities/Question";
import { Language } from "./../../orm/entities/Language";
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
		let ormQuestion = await getConnection()
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
					.where("language.short_name = :short_name", { short_name: language })
					.getQuery();
				return "questioninfo.language_id IN " + subQuery;
			})
			.getOne();
		let gameAnswers: GameAnswer[] = [];
		ormQuestion.answers.forEach((ormAnswer) => {
			gameAnswers.push(new GameAnswer(ormAnswer.label, ormAnswer.isRight));
		});

		let gameQuestion = new GameQuestion(gameAnswers, ormQuestion.questionInfos[0].questionFlashFile);

		return gameQuestion;
	}
}
