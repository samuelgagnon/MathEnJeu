import { createConnection, getRepository } from "typeorm";
import { Answer } from "./entities/Answer";
import { AnswerInfo } from "./entities/AnswerInfo";
import { AnswerType } from "./entities/AnswerType";
import { AnswerTypeInfo } from "./entities/AnswerTypeInfo";
import { Language } from "./entities/Language";
import { LanguageInfo } from "./entities/LanguageInfo";
import { Question } from "./entities/Question";
import { QuestionInfo } from "./entities/QuestionInfo";

export default class DatabaseHandler {
	private host: string = "db";
	private username: string = "user";
	private password: string = "123";
	private database: string = "mathamaze2";
	private port: number = 3306;

	constructor(host: string, username: string, password: string, database: string, port: number) {
		this.host = host;
		this.username = username;
		this.password = password;
		this.database = database;
		this.port = port;
	}

	getFirstQuestion(): Question {
		let firstQuestion = new Question();

		createConnection({
			type: "mysql",
			host: this.host,
			port: this.port,
			username: this.username,
			password: this.password,
			database: this.database,
			entities: [Question, Answer, AnswerInfo, QuestionInfo, Language, LanguageInfo, AnswerType, AnswerTypeInfo],
			synchronize: true,
		})
			.then((connection) => {
				// here you can start to work with your entities
				console.log("ORM connection status : OK. ");
				getRepository(Question)
					.createQueryBuilder("question")
					.where("question.question_id = :id", { id: 1 })
					.getOne()
					.then((question) => {
						console.log("ORM query status : OK. ");
						firstQuestion = question;
					})
					.catch((error) => {
						console.log("ORM query status : ERROR. " + error);
						throw error;
					});
			})
			.catch((error) => {
				console.log("ORM connection status : ERROR. " + error);
				throw error;
			});
		return firstQuestion;
	}
}
