import bodyParser from "body-parser";
import { Application } from "express";
import fs from "fs";
import { Server as HTTPServer } from "http";
import path from "path";
import "reflect-metadata";
import ErrorReport from "../communication/ErrorReport";
import { Question } from "../gameCore/race/question/Question";
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
					res.sendFile(path.join(__dirname, `assets/questions_png/${question.getQuestionRelativePath()}`));
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

		this.app.get("/generate_latex_files", async (req, res) => {
			this.questionRepo
				.getAllQuestions()
				.then((questions: any[]) => {
					const questionPromises: Promise<any>[] = questions.map((question) => this.writeLatexFile(question, false));
					const feedbackPromises: Promise<any>[] = questions.map((question) => this.writeLatexFile(question, true));

					Promise.all(questionPromises.concat(feedbackPromises))
						.then((_) => {
							console.log("done");
							res.sendStatus(200);
						})
						.catch((err) => {
							console.error(err);
							res.sendStatus(err);
						});
				})
				.catch((error) => {
					console.log("ORM query status " + error);
					res.send(error);
				});
		});

		this.app.get("/questionFeedbackImage", async (req, res) => {
			const questionId = req.query.id;
			const languageShortName = req.query.languageShortName;
			const schoolGradeId = req.query.schoolGradeId;

			this.questionRepo
				.getQuestionById(Number(questionId), languageShortName.toString(), Number(schoolGradeId))
				.then((question: Question) => {
					res.sendFile(path.join(__dirname, `assets/questions_png/${question.getFeedbackRelativePath()}`));
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

	private writeLatexFile(question: any, isFeedback: boolean): Promise<any> {
		const data = isFeedback ? question.feedbackLatex : question.questionLatex;
		const directory = isFeedback ? "feedback_latex" : "question_latex";
		return new Promise((resolve, reject) => {
			fs.writeFile(path.join(__dirname, `assets/${directory}/question_${question.questionId}_${question.shortName}.tex`), data, (err) => {
				if (err) {
					reject("Writing file error!");
				} else {
					resolve("Writing file successful !");
				}
			});
		});
	}
}
