import { QuestionFoundFromBookEvent } from "../../../communication/race/DataInterfaces";
import { Clock } from "../../../gameCore/clock/Clock";
import { ItemType } from "../../../gameCore/race/items/Item";
import { Answer } from "../../../gameCore/race/question/Answer";
import { Question } from "../../../gameCore/race/question/Question";
import QuestionMapper from "../../../gameCore/race/question/QuestionMapper";
import { CST } from "../../CST";
import { createHtmlAnswer, createHtmlFeedback, createHtmlQuestion, createInvisibleDiv } from "../CustomHtml";
import { EventNames, sceneEvents, subscribeToEvent } from "./RaceGameEvents";
import RaceScene from "./RaceScene";

export default class QuestionScene extends Phaser.Scene {
	position: Point;
	width: number;
	height: number;
	sizeFactor: number;
	targetLocation: Point;
	question: Question;

	answersButton: Phaser.GameObjects.DOMElement[];
	answersHtml: Phaser.GameObjects.DOMElement[];
	questionHtml: Phaser.GameObjects.DOMElement;
	feedbackHtml: Phaser.GameObjects.DOMElement;

	enterButton: Phaser.GameObjects.Text;
	continueButton: Phaser.GameObjects.Text;
	correctAnswer: Phaser.GameObjects.Text;
	inputHtml: Phaser.GameObjects.DOMElement;
	reportProblemButton: Phaser.GameObjects.Text;

	bookIcon: Phaser.GameObjects.Sprite;
	crystalBallIcon: Phaser.GameObjects.Sprite;
	bookCount: Phaser.GameObjects.Text;
	crystalBallCount: Phaser.GameObjects.Text;

	feedbackMaxTime: number;
	feedbackStartTimeStamp: number;
	feedbackRemainingTimeTxt: Phaser.GameObjects.Text;
	showFeedbackTime: boolean;
	background: Phaser.GameObjects.Rectangle;

	constructor() {
		const sceneConfig = { key: CST.SCENES.QUESTION_WINDOW };
		super(sceneConfig);
	}

	init(data: QuestionSceneData) {
		this.question = data.question;
		this.targetLocation = data.targetLocation;
		this.showFeedbackTime = false;
		this.feedbackStartTimeStamp = undefined;
		this.answersButton = [];
		this.answersHtml = [];

		this.sizeFactor = 0.9;
		this.width = Number(this.game.config.width) * 0.9;
		this.height = Number(this.game.config.height) * 0.9;

		var x = Number(this.game.config.width) * 0.5;
		var y = Number(this.game.config.height) * 0.5;
		this.position = { x: x, y: y };
	}

	create() {
		this.background = this.add.rectangle(this.position.x, this.position.y, this.width, this.height, 0xffffff);

		this.inputHtml = this.add.dom(this.width * 0.4, this.height * 0.85).createFromCache(CST.HTML.ANSWER_INPUT);

		this.enterButton = this.add
			.text(this.width * 0.65, this.height * 0.9, "enter", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#000000",
				fontStyle: "bold",
			})
			.setScrollFactor(0)
			.setInteractive({
				useHandCursor: true,
			});

		this.enterButton.on("pointerup", () => {
			this.answerQuestion();
		});

		this.continueButton = this.add
			.text(this.width * 0.8, this.height * 0.9, "Continue", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#000000",
				fontStyle: "bold",
			})
			.setScrollFactor(0)
			.setInteractive({
				useHandCursor: true,
			})
			.setVisible(false)
			.setActive(false);

		this.continueButton.on("pointerup", () => {
			this.destroyScene();
		});

		this.correctAnswer = this.add
			.text(this.width * 0.8, this.height * 0.9, "correct answer", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#000000",
				fontStyle: "bold",
			})
			.setScrollFactor(0)
			.setInteractive({
				useHandCursor: true,
			});

		//DEBUG
		this.correctAnswer.on("pointerup", () => {
			(<RaceScene>this.scene.get(CST.SCENES.RACE_GAME)).answerQuestion(
				new Answer(undefined, "42, The Answer to the Ultimate Question of Life, the Universe, and Everything"),
				this.targetLocation
			);
		});

		this.reportProblemButton = this.add
			.text(this.width * 0.8, this.height * 0.1, "Report problem", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#000000",
				fontStyle: "bold",
			})
			.setScrollFactor(0)
			.setInteractive({
				useHandCursor: true,
			});

		this.reportProblemButton.on("pointerup", () => {
			sceneEvents.emit(EventNames.errorWindowOpened);
			this.scene.launch(CST.SCENES.REPORT_ERROR, {
				questionId: this.question.getId(),
			});
		});

		this.bookIcon = this.add
			.sprite(Number(this.game.config.width) * 0.1, Number(this.game.config.height) * 0.9, CST.IMAGES.BOOK)
			.setInteractive({ useHandCursor: true })
			.setScale(0.1);
		this.crystalBallIcon = this.add
			.sprite(Number(this.game.config.width) * 0.2, Number(this.game.config.height) * 0.9, CST.IMAGES.CRYSTAL_BALL)
			.setInteractive({ useHandCursor: true })
			.setScale(0.1);

		this.bookIcon.on("pointerdown", () => {
			this.bookIcon.setTint(0xffea00);
		});
		this.bookIcon.on("pointerover", () => {
			this.bookIcon.clearTint();
		});
		this.bookIcon.on("pointerup", () => {
			this.bookIcon.clearTint();
			sceneEvents.emit(EventNames.useBook, this.question.getDifficulty());
		});

		this.crystalBallIcon.on("pointerdown", () => {
			this.crystalBallIcon.setTint(0xffea00);
		});
		this.crystalBallIcon.on("pointerover", () => {
			this.crystalBallIcon.clearTint();
		});
		this.crystalBallIcon.on("pointerup", () => {
			this.crystalBallIcon.clearTint();
			this.useCrystalBall();
		});

		this.bookCount = this.add
			.text(this.bookIcon.getTopRight().x - 7, this.bookIcon.getTopRight().y, "0", {
				fontFamily: "Arial",
				fontSize: "20px",
				align: "center",
				color: "#000000",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.crystalBallCount = this.add
			.text(this.crystalBallIcon.getTopRight().x + 5, this.crystalBallIcon.getTopRight().y, "0", {
				fontFamily: "Arial",
				fontSize: "20px",
				align: "center",
				color: "#000000",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.getHtmlForQuestion();

		subscribeToEvent(EventNames.gameResumed, this.resumeGame, this);
		subscribeToEvent(EventNames.gamePaused, this.pauseGame, this);
		subscribeToEvent(EventNames.errorWindowClosed, this.errorWindowClosed, this);
		subscribeToEvent(EventNames.errorWindowOpened, this.pauseGame, this);
		subscribeToEvent(EventNames.newQuestionFound, this.handleNewQuestionFound, this);
		subscribeToEvent(EventNames.questionCorrected, this.questionCorrected, this);
		subscribeToEvent(EventNames.gameEnds, () => this.scene.stop(), this);
	}

	update() {
		const raceGame = (<RaceScene>this.scene.get(CST.SCENES.RACE_GAME)).raceGame;

		if (this.showFeedbackTime) {
			const feedbackRemainingTime = this.feedbackStartTimeStamp - Clock.now() + this.feedbackMaxTime;
			if (feedbackRemainingTime > 0) {
				this.feedbackRemainingTimeTxt.setText(Math.ceil(feedbackRemainingTime / 1000).toString());
			} else if (!raceGame.getCurrentPlayer().isInPenaltyState()) {
				this.feedbackRemainingTimeTxt.setActive(false).setVisible(false);
				this.endPenalty();
			}
		}

		const inventoryState = raceGame.getCurrentPlayer().getInventory().getInventoryState();
		this.bookCount.setText(inventoryState.bookCount.toString());
		this.crystalBallCount.setText(inventoryState.crystalBallCount.toString());
	}

	private endPenalty(): void {
		this.continueButton.setActive(true).setVisible(true);
	}

	private questionCorrected(isAnswerRight: boolean): void {
		if (isAnswerRight) {
			this.destroyScene();
		} else {
			this.startFeedback();
		}
	}

	private startFeedback() {
		const raceGame = (<RaceScene>this.scene.get(CST.SCENES.RACE_GAME)).raceGame;
		this.answersHtml.forEach((answer) => answer.setAlpha(0).setActive(false).setVisible(false));
		this.answersButton.forEach((answer) => answer.setAlpha(0).setActive(false).setVisible(false));
		this.inputHtml.setAlpha(0).setActive(false).setVisible(false);
		this.enterButton.setAlpha(0).setActive(false).setVisible(false);
		this.correctAnswer.setAlpha(0).setActive(false).setVisible(false);
		this.questionHtml.setAlpha(0).setActive(false).setVisible(false);
		this.feedbackStartTimeStamp = Clock.now();
		//Approximation of feedbackMaxTime by checking remaining time.
		this.feedbackMaxTime = raceGame.getCurrentPlayer().getEndOfPenaltyTimestamp() - Clock.now();

		this.feedbackRemainingTimeTxt = this.add
			.text(Number(this.game.config.width) * 0.8, Number(this.game.config.height) * 0.15, this.feedbackMaxTime.toString(), {
				fontFamily: "Courier",
				fontSize: "26px",
				align: "center",
				color: "#cc0000",
				fontStyle: "bold",
			})
			.setScrollFactor(0);
		this.feedbackHtml.setAlpha(1).setVisible(true);

		this.showFeedbackTime = true;
	}

	private getHtmlForQuestion(): void {
		//debug
		console.log(`QuestionId: ${this.question.getId()}`);

		if (!!this.questionHtml || !!this.feedbackHtml) {
			this.questionHtml.destroy();
			this.feedbackHtml.destroy();
		}

		this.questionHtml = createHtmlQuestion(
			this,
			Number(this.game.config.width) * 0.45,
			Number(this.game.config.height) * 0.25,
			800,
			300,
			this.question.getId()
		);
		this.feedbackHtml = createHtmlFeedback(
			this,
			Number(this.game.config.width) * 0.45,
			Number(this.game.config.height) * 0.25,
			800,
			300,
			this.question.getId()
		).setAlpha(0);

		if (this.question.getAnswerType() === "MULTIPLE_CHOICE") {
			this.generateHtmlAnswers();
		} else {
			this.inputHtml.setAlpha(1);
		}
	}

	private generateHtmlAnswers() {
		if (this.answersHtml.length > 0 || this.answersButton.length > 0) {
			this.answersHtml.forEach((element) => element.destroy());
			this.answersButton.forEach((element) => element.destroy());

			this.answersHtml = [];
			this.answersButton = [];
		}
		this.question.getAnswers().forEach((answer: Answer, index: number) => {
			const answerHtml = createHtmlAnswer(
				this,
				Number(this.game.config.width) * 0.2 + 200 * index + 20,
				Number(this.game.config.height) * 0.65,
				150,
				150,
				answer.getId()
			)
				.setDepth(1)
				.setAlpha(0);

			this.answersHtml.push(answerHtml);

			const invisibleDiv = createInvisibleDiv(
				this,
				Number(this.game.config.width) * 0.2 + 200 * index + 20,
				Number(this.game.config.height) * 0.65,
				150,
				150
			).setDepth(3);

			invisibleDiv.addListener("click");
			invisibleDiv.on("click", () => {
				this.answerQuestion(this.question.getAnswers()[index]);
			});

			this.answersButton.push(invisibleDiv);

			this.inputHtml.setAlpha(0);
			this.enterButton.setAlpha(0);
		});

		this.answersHtml.forEach((answer) => answer.setAlpha(1));
	}

	private answerQuestion(answer?: Answer): void {
		if (!answer) {
			answer = this.question.getAnswer((<HTMLInputElement>this.inputHtml.getChildByName("answerField")).value);
		}
		sceneEvents.emit(EventNames.answerQuestion, answer, this.targetLocation);
	}

	private destroyScene(): void {
		this.scene.stop(CST.SCENES.REPORT_ERROR);
		this.scene.stop(CST.SCENES.QUESTION_WINDOW);
	}

	private useCrystalBall(): void {
		//TODO: Make constants of the types
		if (this.question.getAnswerType() == "MULTIPLE_CHOICE" || this.question.getAnswerType() == "MULTIPLE_CHOICE_5") {
			if (!this.question.areAllAnswersRight()) {
				try {
					sceneEvents.emit(EventNames.useCrystalBall, ItemType.CrystalBall);
					this.question.removeWrongAnswer();
					this.generateHtmlAnswers();
				} catch (error) {
					console.log(error);
				}
			}
		} else {
			alert("must be a multiple choice question");
		}
	}

	private newQuestionFound(question: Question): void {
		this.question = question;
		this.getHtmlForQuestion();
	}

	private pauseGame() {
		this.feedbackHtml.setAlpha(0).setActive(false).setVisible(false);
		this.questionHtml.setAlpha(0).setActive(false).setVisible(false);
		this.answersHtml.forEach((element) => element.setAlpha(0).setActive(false).setVisible(false));
		this.answersButton.forEach((element) => element.setAlpha(0).setActive(false).setVisible(false));
		this.input.enabled = false;
	}

	private resumeGame() {
		const questionAlpha = this.showFeedbackTime ? 0 : 1;
		const feedbackAlpha = this.showFeedbackTime ? 1 : 0;

		this.feedbackHtml.setAlpha(feedbackAlpha).setVisible(this.showFeedbackTime).setActive(this.showFeedbackTime);
		this.questionHtml.setAlpha(questionAlpha).setVisible(!this.showFeedbackTime).setActive(!this.showFeedbackTime);
		this.answersHtml.forEach((element) => element.setAlpha(questionAlpha).setActive(!this.showFeedbackTime).setVisible(!this.showFeedbackTime));
		this.answersButton.forEach((element) => element.setAlpha(questionAlpha).setActive(!this.showFeedbackTime).setVisible(!this.showFeedbackTime));
		this.input.enabled = true;
	}

	private errorWindowClosed(isFromQuestionScene: boolean) {
		this.inputHtml.setActive(isFromQuestionScene).setVisible(isFromQuestionScene);
		this.input.enabled = isFromQuestionScene;
	}

	private handleNewQuestionFound(data: QuestionFoundFromBookEvent) {
		this.newQuestionFound(QuestionMapper.fromDTO(data.questionDTO));
	}
}

export interface QuestionSceneData {
	question: Question;
	targetLocation: Point;
}
