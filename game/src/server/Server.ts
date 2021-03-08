import bodyParser from "body-parser";
import { Application } from "express";
import fs from "fs";
import { Server as HTTPServer } from "http";
import { JSDOM } from "jsdom";
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

		this.app.get("/question-image/:id", async (req, res) => {
			const questionId = req.params.id;
			const fileName = this.renameToSVGFile(questionId);

			res.sendFile(path.join(__dirname, `assets/question_images/${fileName}`));
		});

		this.app.get("/question-html/:id", (req, res) => {
			const questionId = req.params.id;
			const languageShortName = !!req.query.languageShortName ? req.query.languageShortName : "fr";

			res.sendFile(path.join(__dirname, `assets/question_html/questions_html/question_${questionId}_${languageShortName}.html`));
		});

		this.app.get("/feedback-html/:id", (req, res) => {
			const questionId = req.params.questionId;
			const languageShortName = req.query.languageShortName;

			res.sendFile(path.join(__dirname, `assets/question_html/feedback_html/feedback_${questionId}_${languageShortName}.html`));
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

		//TODO maybe remove it in production
		this.app.get("/generate-questions-latex-files", async (req, res) => {
			this.questionRepo
				.getAllQuestions()
				.then((questions: any[]) => {
					const questionPromises: Promise<any>[] = questions.map((question) => this.writeQuestionsLatexFile(question, false));
					const feedbackPromises: Promise<any>[] = questions.map((question) => this.writeQuestionsLatexFile(question, true));

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

		this.app.get("/generate-answers-latex-files", async (req, res) => {
			this.questionRepo
				.getAllAnswers()
				.then((answers: any[]) => {
					const answerPromises: Promise<any>[] = answers.map((answer) => this.writeAnswersLatexFile(answer));

					Promise.all(answerPromises)
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

		this.app.get("/append-to-html", async (req, res) => {
			try {
				// await this.appendToHtml("feedback");
				// await this.appendToHtml("questions");
				await this.appendToHtml("answers");

				res.sendStatus(200);
			} catch (error) {
				console.log(error);
				res.send(error);
			}
		});

		this.app.get("/modify-html", async (req, res) => {
			try {
				// await this.modifyHtmlFiles("feedback");
				// await this.modifyHtmlFiles("questions");
				await this.modifyHtmlFiles("answers");

				res.sendStatus(200);
			} catch (error) {
				console.log(error);
				res.send(error);
			}
		});
	}

	private renameToSVGFile(questionId: string) {
		let stringArray = questionId.split(".");
		const lastElement = stringArray[stringArray.length - 1];

		if (lastElement !== "svg") {
			if (lastElement === "eps") stringArray.pop();

			stringArray.push("svg");
		}
		return stringArray.join(".");
	}

	public listen(callback: (port: number) => void): void {
		this.httpServer.listen(this.DEFAULT_PORT, () => callback(this.DEFAULT_PORT));
	}

	private writeQuestionsLatexFile(question: any, isFeedback: boolean): Promise<any> {
		const data = isFeedback ? question.feedbackLatex : question.questionLatex;
		const directory = isFeedback ? "feedback_latex" : "question_latex";
		const fileName = isFeedback ? "feedback" : "question";

		return fs.promises.writeFile(
			path.join(__dirname, `assets/latex_files/${directory}/${fileName}_${question.questionId}_${question.shortName}.tex`),
			data
		);
	}

	private writeAnswersLatexFile(answer: any): Promise<any> {
		return fs.promises.writeFile(
			path.join(__dirname, `assets/latex_files/answers_latex/answer_${answer.answerId}_${answer.shortName}.tex`),
			answer.answerLatex
		);
	}

	private async appendToHtml(directory: string): Promise<void> {
		const dirPath = path.join(__dirname, `assets/question_html`);
		const files = await fs.promises.readdir(`${dirPath}/${directory}_html`);

		const htmlToAppend = await fs.promises.readFile(`${dirPath}/append.html`, { encoding: "utf-8" });

		for (const file of files) {
			console.log(file);
			const filePath = `${dirPath}/${directory}_html/${file}`;
			const htmlToModify = await fs.promises.readFile(filePath, { encoding: "utf-8" });
			await fs.promises.writeFile(filePath, this.modifyHtml(htmlToModify));
			await fs.promises.appendFile(filePath, htmlToAppend);
		}
	}

	private async modifyHtmlFiles(directory: string): Promise<void> {
		const dirPath = path.join(__dirname, `assets/question_html`);
		const files = await fs.promises.readdir(`${dirPath}/${directory}_html`);

		for (const file of files) {
			console.log(file);
			const filePath = `${dirPath}/${directory}_html/${file}`;
			const htmlToModify = await fs.promises.readFile(filePath, { encoding: "utf-8" });
			await fs.promises.writeFile(filePath, this.modifyHtml(htmlToModify));
		}
	}

	private modifyHtml(html: string): string {
		const dom = new JSDOM(html);
		dom.window.document.querySelectorAll("embed").forEach((element) => {
			let image = dom.window.document.createElement("img");
			image.src = element.src;
			element.parentElement.replaceChild(image, element);
		});

		dom.window.document.querySelectorAll("img").forEach((element) => {
			element.src = `${process.env.SERVER_API_URL}/question-image/${this.renameToSVGFile(element.src)}`;
		});

		return dom.window.document.documentElement.innerHTML;
	}
}
