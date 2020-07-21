import { Application } from "express";
import { Server as HTTPServer } from "http";
import path from "path";
import "reflect-metadata";
import QuestionRepository from "./data/QuestionRepository";

export class Server {
	private httpServer: HTTPServer;
	private app: Application;
	private questionRepo: QuestionRepository;

	private readonly DEFAULT_PORT = 8080;

	constructor(app: Application, httpServer: HTTPServer, questionRepo: QuestionRepository) {
		this.app = app;
		this.httpServer = httpServer;
		this.questionRepo = questionRepo;

		this.handleRoutes();
	}

	private handleRoutes(): void {
		this.app.get("/", (req, res) => {
			res.sendFile(path.join(__dirname, "../", "/client/index.html"));
		});

		this.app.get("/question", async (req, res) => {
			const questionId = req.query.id;
			const languageShortName = req.query.languageShortName;
			console.log(`id:${Number(questionId)} languageShortName:${languageShortName.toString()}`);

			this.questionRepo
				.getQuestionById(Number(questionId), languageShortName.toString())
				.then((question) => {
					console.log("ORM query status : OK. ");
					console.log("query result : " + question.getQuestionRelativePath());
					res.sendFile(path.join(__dirname, `assets/${question.getQuestionRelativePath()}`));
				})
				.catch((error) => {
					console.log("ORM query status " + error);
					res.send(error);
				});
		});
	}

	public listen(callback: (port: number) => void): void {
		this.httpServer.listen(this.DEFAULT_PORT, () => callback(this.DEFAULT_PORT));
	}
}
