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

		this.app.get("/question-style.css", async (req, res) => {
			res.sendFile(path.join(__dirname, `assets/question_html/question-style.css`));
		});

		this.app.get("/question-image/:id", async (req, res) => {
			const questionId = req.params.id;
			const fileName = this.renameToSVGFile(questionId);

			res.sendFile(path.join(__dirname, `assets/question_images/${fileName}`));
		});

		this.app.get("/question-html/:id", (req, res) => {
			const questionId = req.params.id;
			const languageShortName = !!req.query.lg ? req.query.lg : "fr";

			res.sendFile(path.join(__dirname, `assets/question_html/questions_html/question_${questionId}_${languageShortName}.html`));
		});

		this.app.get("/feedback-html/:id", (req, res) => {
			const feedbackId = req.params.id;
			const languageShortName = !!req.query.lg ? req.query.lg : "fr";

			res.sendFile(path.join(__dirname, `assets/question_html/feedback_html/feedback_${feedbackId}_${languageShortName}.html`));
		});

		this.app.get("/answer-html/:id", (req, res) => {
			const answerId = req.params.id;
			const languageShortName = !!req.query.lg ? req.query.lg : "fr";

			res.sendFile(path.join(__dirname, `assets/question_html/answers_html/answer_${answerId}_${languageShortName}.html`));
		});

		//DEBUG : The goal is to be able to check a whole question quickly
		this.app.get("/question/:id", async (req, res) => {
			try {
				const questionId = req.params.id;
				const languageShortName = !!req.query.lg ? req.query.lg : "fr";
				const questionHtml = await fs.promises.readFile(
					path.join(__dirname, `assets/question_html/questions_html/question_${questionId}_${languageShortName}.html`),
					{
						encoding: "utf-8",
					}
				);
				const feedbackHtml = await fs.promises.readFile(
					path.join(__dirname, `assets/question_html/feedback_html/feedback_${questionId}_${languageShortName}.html`),
					{
						encoding: "utf-8",
					}
				);

				const question: Question = await this.questionRepo.getQuestionById(Number(questionId), languageShortName.toString());
				let answersHtml: string[] = [];
				let i = 0;
				for (const answer of question.getAnswers()) {
					const answerHtml = await fs.promises.readFile(
						path.join(__dirname, `assets/question_html/answers_html/answer_${answer.getId()}_${languageShortName}.html`),
						{
							encoding: "utf-8",
						}
					);
					answersHtml[i] = answerHtml;
					i++;
				}

				let response: string = "";
				response += `********** QUESTION (id=${questionId}, lg=${languageShortName}, type=${question.getAnswerType()})**********<br>${questionHtml}`;
				i = 0;
				for (const answer of question.getAnswers()) {
					response += `<br><br>********** ANSWER #${i + 1} (id=${answer.getId()}, isRight=${answer.getIsRight()}) **********<br> ${answersHtml[i]}`;
					i++;
				}
				response += `<br>********** FEEDBACK **********<br><br> ${feedbackHtml}`;
				res.send(response);
			} catch (error) {
				console.log(error);
				res.send(error);
			}
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
				await this.appendToHtml("feedback");
				await this.appendToHtml("questions");
				await this.appendToHtml("answers");

				res.sendStatus(200);
			} catch (error) {
				console.log(error);
				res.send(error);
			}
		});

		this.app.get("/modify-html", async (req, res) => {
			try {
				await this.modifyHtmlFiles("feedback");
				await this.modifyHtmlFiles("questions");
				await this.modifyHtmlFiles("answers");

				console.log("Process finished");
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
			const newHtml = this.modifyHtml(htmlToModify);
			await fs.promises.writeFile(filePath, newHtml);
		}
	}

	private modifyHtml(html: string): string {
		//Problem : In Pandoc, "\begin{wrapfigure}[lineheight]{position}{width} [...] \end{wrapfigure}" is replaced with "<div class="wrapfigure"><span>r</span>[0pt]<span>0pt</span> [...] </div>".
		//Solution :
		const WRAPFIG_MESSY_CONVERSIONS = [
			"<span>r</span>[0pt]<span>0pt</span>",
			"<span>r</span>[0 pt]<span>0 pt</span>",
			"<span>r</span>[0 pt]<span>0pt</span>",
		];
		WRAPFIG_MESSY_CONVERSIONS.forEach((WRAPFIG_MESSY_CONVERSION) => {
			html = html.replace(WRAPFIG_MESSY_CONVERSION, "");
		});

		const dom = new JSDOM(html);

		//Add stylesheet reference
		dom.window.document.head.innerHTML = `<link rel="stylesheet" href="../question-style.css">`;

		//Problem : Some "img" tags are replaced with "embed" tags
		//Solution :
		dom.window.document.querySelectorAll("embed").forEach((element) => {
			let image = dom.window.document.createElement("img");
			image.src = element.src;
			image.setAttribute("style", element.getAttribute("style"));
			element.parentElement.replaceChild(image, element);
		});

		//Image source link has to be specified
		dom.window.document.querySelectorAll("img").forEach((element) => {
			if (!element.src.includes(`../question-image/`)) {
				element.src = `../question-image/${this.renameToSVGFile(element.src)}`;
			}
		});

		//Problem : In Pandoc, blank spaces for answers ("___") are replaced with <u></u> (which shows nothing).
		//Solution : Replace <u></u> with "___".
		dom.window.document.querySelectorAll("u").forEach((element) => {
			if (element.innerHTML === "") {
				element.innerHTML = "___";
			}
		});

		return dom.window.document.documentElement.innerHTML;
	}
}
