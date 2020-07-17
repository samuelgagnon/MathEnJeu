import { getConnection, getRepository } from "typeorm";
import { Question as gameQuestion } from "../../GameCore/Race/Question";
import { Question as ormQuestion } from "../../orm/entities/Question";
import QuestionRepository from "./questionRepository";

export default class QuestionDbRepository implements QuestionRepository {
	constructor() {}

	//TODO
	getQuestionsForPlayer(playerLevel: number, difficulty: number): Promise<gameQuestion[]> {
		getRepository(ormQuestion)
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

	//TODO
	async getQuestionById(questionId: number): Promise<gameQuestion> {
		getConnection()
			.getRepository(ormQuestion)
			.createQueryBuilder("question")
			.where("question.question_id = :id", { id: questionId })
			.getOne()
			.then((question) => {
				console.log("ORM query status : OK. ");
				console.log("query result : " + question.label);
			})
			.catch((error) => {
				console.log("ORM query status : ERROR. " + error);
			});
		return new gameQuestion();
	}
}
