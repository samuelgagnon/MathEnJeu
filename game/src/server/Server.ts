import bodyParser from "body-parser";
import { Application } from "express";
import { Server as HTTPServer } from "http";
import path from "path";
import "reflect-metadata";
import ErrorReport from "../communication/ErrorReport";
import QuestionRepository from "./data/QuestionRepository";
import ReportedErrorRepository from "./data/ReportedErrorRepository";

export class Server {
	private httpServer: HTTPServer;
	private app: Application;
	private questionRepo: QuestionRepository;
	private errorRepo: ReportedErrorRepository;

	private readonly DEFAULT_PORT = Number(process.env.PORT) || 8080;

	constructor(app: Application, httpServer: HTTPServer, questionRepo: QuestionRepository, errorRepo: ReportedErrorRepository) {
		this.app = app;
		this.httpServer = httpServer;
		this.questionRepo = questionRepo;
		this.errorRepo = errorRepo;

		this.handleRoutes();
	}

	private handleRoutes(): void {
		const jsonParser = bodyParser.json();

		this.app.get("/error", (req, res) => {
			res.sendFile(path.join(__dirname, "../", "/client/pages/construction.html"));
		});

		this.app.get("/", (req, res) => {
			res.sendFile(path.join(__dirname, "../", "/client/index.html"));
		});

		this.app.get("/questionImage", async (req, res) => {
			const questionId = req.query.id;
			const languageShortName = req.query.languageShortName;
			const schoolGradeId = req.query.schoolGradeId;

			this.questionRepo
				.getQuestionById(Number(questionId), languageShortName.toString(), Number(schoolGradeId))
				.then((question) => {
					res.sendFile(path.join(__dirname, `assets/${question.getQuestionRelativePath()}`));
				})
				.catch((error) => {
					console.log("Query status " + error);
					res.send(error);
				});
		});

		this.app.get("/question_image/:id", async (req, res) => {
			const questionId = req.params.id;
			res.sendFile(path.join(__dirname, `assets/question_images/${questionId}`));
		});

		this.app.get("/questionFeedbackImage", async (req, res) => {
			const questionId = req.query.id;
			const languageShortName = req.query.languageShortName;
			const schoolGradeId = req.query.schoolGradeId;

			this.questionRepo
				.getQuestionById(Number(questionId), languageShortName.toString(), Number(schoolGradeId))
				.then((question) => {
					res.sendFile(path.join(__dirname, `assets/${question.getFeedbackRelativePath()}`));
				})
				.catch((error) => {
					console.log("ORM query status " + error);
					res.send(error);
				});
		});

		this.app.post("/errorReport", jsonParser, (req, res) => {
			const body: ErrorReport = req.body;
			console.log(body);
			this.errorRepo.addReportedError(body.languageShortName, body.errorDescription, JSON.stringify(body.errorLog), body.username, body.questionId);
		});
	}

	public listen(callback: (port: number) => void): void {
		this.httpServer.listen(this.DEFAULT_PORT, process.env.SERVER_API_URL, () => callback(this.DEFAULT_PORT));
	}
}
