import { getConnection, getRepository } from "typeorm";
import { Answer as GameAnswer } from "../../GameCore/Race/Answer";
import { Question as GameQuestion } from "../../GameCore/Race/Question";
import { Question as OrmQuestion } from "../../orm/entities/Question";
import QuestionRepository from "./questionRepository";

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

	async getQuestionById(questionId: number): Promise<GameQuestion> {
		let ormQuestion = await getConnection()
			.getRepository(OrmQuestion)
			.createQueryBuilder("question")
			.leftJoinAndSelect("question.answers", "answer")
			.leftJoinAndSelect("question.questionInfo", "questioninfo")
			.where("question.question_id = :id", { id: questionId })
			.getOne();
		let gameAnswers: GameAnswer[] = [];
		ormQuestion.answers.forEach((ormAnswer) => {
			gameAnswers.push(new GameAnswer(ormAnswer.label, ormAnswer.isRight));
		});

		let gameQuestion = new GameQuestion(gameAnswers, ormQuestion.questionInfo.questionFlashFile);

		return gameQuestion;
	}
}
