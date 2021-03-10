import { QuestionFoundFromBookEvent } from "../../../communication/race/DataInterfaces";
import { Clock } from "../../../gameCore/clock/Clock";
import { ItemType } from "../../../gameCore/race/items/Item";
import { Answer } from "../../../gameCore/race/question/Answer";
import { Question } from "../../../gameCore/race/question/Question";
import QuestionMapper from "../../../gameCore/race/question/QuestionMapper";
import { CST } from "../../CST";
import { createHtmlFeedback, createHtmlQuestion } from "../CustomHtml";
import { EventNames, sceneEvents, subscribeToEvent } from "./RaceGameEvents";
import RaceScene from "./RaceScene";

export default class QuestionScene extends Phaser.Scene {
	position: Point;
	width: number;
	height: number;
	sizeFactor: number;
	targetLocation: Point;
	question: Question;

	questionHtml: Phaser.GameObjects.DOMElement;
	feedbackHtml: Phaser.GameObjects.DOMElement;

	enterButton: Phaser.GameObjects.Text;
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

	constructor() {
		const sceneConfig = { key: CST.SCENES.QUESTION_WINDOW };
		super(sceneConfig);
	}

	init(data: QuestionSceneData) {
		this.question = data.question;
		this.targetLocation = data.targetLocation;
		this.showFeedbackTime = false;
		this.feedbackStartTimeStamp = undefined;

		this.sizeFactor = 0.9;
		this.width = Number(this.game.config.width) * 0.9;
		this.height = Number(this.game.config.height) * 0.9;

		var x = Number(this.game.config.width) * 0.05;
		var y = Number(this.game.config.height) * 0.05;
		this.position = { x: x, y: y };
	}

	create() {
		this.cameras.main.setViewport(this.position.x, this.position.y, this.width, this.height);
		this.cameras.main.setBackgroundColor(0xffffff);

		this.inputHtml = this.add.dom(this.width * 0.4, this.height * 0.85).createFromCache(CST.HTML.ANSWER_INPUT);

		this.enterButton = this.add
			.text(this.width * 0.6, this.height * 0.85, "enter", {
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

		this.correctAnswer = this.add
			.text(this.width * 0.8, this.height * 0.85, "correct answer", {
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

		this.enterButton.on("pointerup", () => {
			this.answerQuestion();
		});

		//DEBUG
		this.correctAnswer.on("pointerup", () => {
			(<RaceScene>this.scene.get(CST.SCENES.RACE_GAME)).answerQuestion(
				new Answer(undefined, "42, The Answer to the Ultimate Question of Life, the Universe, and Everything"),
				this.targetLocation
			);
		});

		this.reportProblemButton.on("pointerup", () => {
			sceneEvents.emit(EventNames.errorWindowOpened);
			this.scene.launch(CST.SCENES.REPORT_ERROR, {
				questionId: this.question.getId(),
			});
		});

		this.bookIcon = this.add
			.sprite(this.width * 0.05, this.height * 0.9, CST.IMAGES.BOOK)
			.setInteractive({ useHandCursor: true })
			.setScale(0.1);
		this.crystalBallIcon = this.add
			.sprite(this.width * 0.15, this.height * 0.9, CST.IMAGES.CRYSTAL_BALL)
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
				this.endPenalty();
			}
		}

		const inventoryState = raceGame.getCurrentPlayer().getInventory().getInventoryState();
		this.bookCount.setText(inventoryState.bookCount.toString());
		this.crystalBallCount.setText(inventoryState.crystalBallCount.toString());
	}

	private endPenalty(): void {
		//TODO: Instead of destroying this scene instantly, show a button used to quit the feedback (at this scene in general).
		this.destroyScene();
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
		this.inputHtml.setAlpha(0);
		this.correctAnswer.setAlpha(0);
		this.feedbackStartTimeStamp = Clock.now();
		//Approximation of feedbackMaxTime by checking remaining time.
		this.feedbackMaxTime = raceGame.getCurrentPlayer().getEndOfPenaltyTimestamp() - Clock.now();

		this.feedbackRemainingTimeTxt = this.add
			.text(this.width * 0.8, this.height * 0.1, this.feedbackMaxTime.toString(), {
				fontFamily: "Courier",
				fontSize: "26px",
				align: "center",
				color: "#cc0000",
				fontStyle: "bold",
			})
			.setScrollFactor(0);
		//this.feedbackImage.setAlpha(1);

		this.showFeedbackTime = true;
	}

	private getHtmlForQuestion(): void {
		this.questionHtml = createHtmlQuestion(
			this,
			Number(this.game.config.width) * 0.5,
			Number(this.game.config.height) * 0.35,
			900,
			600,
			this.question.getId()
		);
		this.feedbackHtml = createHtmlFeedback(
			this,
			Number(this.game.config.width) * 0.5,
			Number(this.game.config.height) * 0.35,
			900,
			600,
			this.question.getId()
		).setVisible(false);
	}

	private answerQuestion(): void {
		const answer = this.question.getAnswer((<HTMLInputElement>this.inputHtml.getChildByName("answerField")).value);
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
		this.feedbackHtml.setVisible(false).setActive(false);
		this.questionHtml.setVisible(false).setActive(false);
		this.input.enabled = false;
	}

	private resumeGame() {
		this.feedbackHtml.setVisible(this.showFeedbackTime).setActive(this.showFeedbackTime);
		this.questionHtml.setVisible(!this.showFeedbackTime).setActive(!this.showFeedbackTime);
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
