import { Application } from "express";
import { Server as HTTPServer } from "http";
import path from "path";
import "reflect-metadata";
import { getConnection } from "typeorm";
import { Question } from "../orm/entities/Question";

export class Server {
	private httpServer: HTTPServer;
	private app: Application;

	private readonly DEFAULT_PORT = 8080;

	constructor(app: Application, httpServer: HTTPServer) {
		this.app = app;
		this.httpServer = httpServer;

		this.handleRoutes();
	}

	private handleRoutes(): void {
		this.app.get("/", (req, res) => {
			res.sendFile(path.join(__dirname, "../", "/client/index.html"));
		});

		this.app.get("/question/:id", async (req, res) => {
			const questionId = req.params.id;
			getConnection()
				.getRepository(Question)
				.createQueryBuilder("question")
				.where("question.question_id = :id", { id: questionId })
				.getOne()
				.then((question) => {
					console.log("ORM query status : OK. ");
					console.log("query result : " + question.label);
					res.send(question);
				})
				.catch((error) => {
					console.log("ORM query status : ERROR. " + error);
					res.send(error);
				});
		});
	}

	public listen(callback: (port: number) => void): void {
		this.httpServer.listen(this.DEFAULT_PORT, () => callback(this.DEFAULT_PORT));
	}
}
