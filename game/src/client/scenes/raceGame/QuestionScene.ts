import { QuestionFoundFromBookEvent } from "../../../communication/race/EventInterfaces";
import { Clock } from "../../../gameCore/clock/Clock";
import { ItemType } from "../../../gameCore/race/items/Item";
import { Answer } from "../../../gameCore/race/question/Answer";
import { Question } from "../../../gameCore/race/question/Question";
import QuestionMapper from "../../../gameCore/race/question/QuestionMapper";
import { getTranslate } from "../../assets/locales/translate";
import { CST } from "../../CST";
import { getUserInfo } from "../../services/UserInformationService";
import {
	createHtmlAnswer,
	createHtmlFeedback,
	createHtmlMultiChoiceFeedback,
	createHtmlMultiChoiceQuestion,
	createHtmlQuestion,
	createInvisibleDiv,
} from "../CustomHtml";
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
	questionWindow: Phaser.GameObjects.Image;
	language: string;

	constructor() {
		const sceneConfig = { key: CST.SCENES.QUESTION_WINDOW };
		super(sceneConfig);
	}

	init(data: QuestionSceneData) {
		this.language = getUserInfo().language;
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
		this.questionWindow = this.add
			.image(Number(this.game.config.width) / 2, Number(this.game.config.height) / 2, CST.IMAGES.QUESTION_WINDOW)
			.setScale(0.8, 0.7);

		var CleUSB_Sortie_09 = this.sound.add(CST.SOUND.CleUSB_Sortie_09);
		var Flash_10 = this.sound.add(CST.SOUND.Flash_10);

		this.inputHtml = this.add.dom(this.questionWindow.x - 300, this.questionWindow.y + 100).createFromCache(CST.HTML.ANSWER_INPUT);
		(<HTMLInputElement>this.inputHtml.getChildByName("answerField")).placeholder = getTranslate("questions.yourAns");
		this.enterButton = this.add
			.text(this.questionWindow.x + 380, this.questionWindow.y + 180, getTranslate("questions.enter"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "25px",
				align: "center",
				color: "#ffffff",
			})
			.setScrollFactor(0)
			.setInteractive({
				useHandCursor: true,
			});

		this.enterButton.on("pointerup", () => {
			this.answerQuestion();
		});

		this.continueButton = this.add
			.text(this.questionWindow.x + 380, this.questionWindow.y + 180, getTranslate("questions.continue"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "25px",
				align: "center",
				color: "#ffffff",
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

		// this.correctAnswer = this.add
		// 	.text(this.questionWindow.x + 380, this.questionWindow.y + 180, getTranslate("questions.rightAns"), {
		// 		fontFamily: "ArcherBoldPro",
		// 		fontSize: "25px",
		// 		align: "center",
		// 		color: "#ffffff",
		// 	})
		// 	.setScrollFactor(0)
		// 	.setInteractive({
		// 		useHandCursor: true,
		// 	});

		// //DEBUG
		// this.correctAnswer.on("pointerup", () => {
		// 	(<RaceScene>this.scene.get(CST.SCENES.RACE_GAME)).answerQuestion(
		// 		new Answer(undefined, "42, The Answer to the Ultimate Question of Life, the Universe, and Everything", true),
		// 		this.targetLocation
		// 	);
		// });

		this.reportProblemButton = this.add
			.text(this.questionWindow.x + 270, this.questionWindow.y - 240, getTranslate("questions.reportProblem"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "25px",
				align: "center",
				color: "#ffffff",
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
			(<HTMLInputElement>this.inputHtml.getChildByName("answerField")).style.opacity = "0";
		});

		this.bookIcon = this.add
			.sprite(this.questionWindow.x - 490, this.questionWindow.y + 200, "Items", 4)
			.setInteractive({ useHandCursor: true })
			.setScale(1.3);

		this.bookIcon
			.on("pointerdown", () => {
				this.bookIcon.setTint(0xffea00);
			})
			.on("pointerover", () => {
				this.bookIcon.clearTint();
			})
			.on("pointerup", () => {
				const raceGame = (<RaceScene>this.scene.get(CST.SCENES.RACE_GAME)).raceGame;
				const itemStatus = raceGame.getCurrentPlayer().getInventory().getInventoryState();

				if (itemStatus.bookCount > 0) {
					CleUSB_Sortie_09.play();
					this.bookIcon.clearTint();
					sceneEvents.emit(EventNames.useBook, this.question.getDifficulty());
				}
			});

		if (this.question.getAnswerType() == "MULTIPLE_CHOICE" || this.question.getAnswerType() == "MULTIPLE_CHOICE_5") {
			this.crystalBallIcon = this.add
				.sprite(this.questionWindow.x - 390, this.questionWindow.y + 200, "Items", 0)
				.setInteractive({ useHandCursor: true })
				.setScale(1.3);

			this.crystalBallIcon
				.on("pointerdown", () => {
					this.crystalBallIcon.setTint(0xffea00);
				})
				.on("pointerover", () => {
					this.crystalBallIcon.clearTint();
				})
				.on("pointerup", () => {
					const raceGame = (<RaceScene>this.scene.get(CST.SCENES.RACE_GAME)).raceGame;
					const itemStatus = raceGame.getCurrentPlayer().getInventory().getInventoryState();

					if (
						itemStatus.crystalBallCount > 0 &&
						(this.question.getAnswerType() == "MULTIPLE_CHOICE" || this.question.getAnswerType() == "MULTIPLE_CHOICE_5")
					) {
						Flash_10.play();
						this.crystalBallIcon.clearTint();
						this.useCrystalBall();
					}
				});

			this.crystalBallCount = this.add
				.text(this.crystalBallIcon.getTopRight().x, this.crystalBallIcon.getTopRight().y - 13, "0", {
					fontFamily: "ArcherBoldPro",
					fontSize: "20px",
					align: "center",
					color: "#ffffff",
				})
				.setScrollFactor(0);
		}

		this.bookCount = this.add
			.text(this.bookIcon.getTopRight().x, this.bookIcon.getTopRight().y - 15, "0", {
				fontFamily: "ArcherBoldPro",
				fontSize: "20px",
				align: "center",
				color: "#ffffff",
			})
			.setScrollFactor(0);

		this.input.keyboard.clearCaptures();

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

		if (inventoryState.bookCount > 0) {
			this.bookIcon.setAlpha(1);
		} else {
			this.bookIcon.setAlpha(0.5);
		}

		if (this.question.getAnswerType() == "MULTIPLE_CHOICE" || this.question.getAnswerType() == "MULTIPLE_CHOICE_5") {
			if (inventoryState.crystalBallCount > 0) {
				this.crystalBallIcon.setAlpha(1);
			} else {
				this.crystalBallIcon.setAlpha(0.5);
			}
		} else {
			this.crystalBallIcon.setAlpha(0);
		}
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
		this.crystalBallIcon.disableInteractive();
		this.bookIcon.disableInteractive();
		const raceGame = (<RaceScene>this.scene.get(CST.SCENES.RACE_GAME)).raceGame;
		this.answersHtml.forEach((answer) => answer.setAlpha(0).setActive(false).setVisible(false));
		this.answersButton.forEach((answer) => answer.setAlpha(0).setActive(false).setVisible(false));
		this.inputHtml.setAlpha(0).setActive(false).setVisible(false);
		this.enterButton.setAlpha(0).setActive(false).setVisible(false);
		// this.correctAnswer.setAlpha(0).setActive(false).setVisible(false);
		this.questionHtml.setAlpha(0).setActive(false).setVisible(false);
		this.feedbackStartTimeStamp = Clock.now();
		//Approximation of feedbackMaxTime by checking remaining time.
		this.feedbackMaxTime = raceGame.getCurrentPlayer().getEndOfPenaltyTimestamp(); // - Clock.now();

		this.feedbackRemainingTimeTxt = this.add
			.text(this.questionWindow.x + 400, this.questionWindow.y - 218, "", {
				//this.feedbackMaxTime.toString()
				fontFamily: "ArcherBoldPro",
				fontSize: "26px",
				align: "center",
				color: "#CC0000",
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

		this.clearAnswers();
		console.log("question: ", this.question);

		if (this.question.getAnswerType() === "MULTIPLE_CHOICE") {
			this.questionHtml = createHtmlMultiChoiceQuestion(
				this,
				this.questionWindow.x - 200,
				this.questionWindow.y - 30,
				500,
				300,
				this.question.getId(),
				this.language
			);
			this.feedbackHtml = createHtmlMultiChoiceFeedback(
				this,
				this.questionWindow.x - 200,
				this.questionWindow.y - 30,
				500,
				300,
				this.question.getId(),
				this.language
			).setAlpha(0);
			this.generateHtmlAnswers();
		} else {
			this.questionHtml = createHtmlQuestion(this, this.questionWindow.x, this.questionWindow.y - 80, 800, 300, this.question.getId(), this.language);
			this.feedbackHtml = createHtmlFeedback(
				this,
				this.questionWindow.x,
				this.questionWindow.y - 30,
				800,
				300,
				this.question.getId(),
				this.language
			).setAlpha(0);

			this.inputHtml.setAlpha(1);
			this.enterButton.setAlpha(1);
		}
	}

	private clearAnswers(): void {
		this.answersHtml.forEach((element: Phaser.GameObjects.DOMElement) => element.destroy());
		this.answersButton.forEach((element: Phaser.GameObjects.DOMElement) => {
			element.removeInteractive();
			element.removeAllListeners();
			element.destroy();
		});

		this.answersHtml = [];
		this.answersButton = [];
	}

	private generateHtmlAnswers() {
		this.question.getAnswers().forEach((answer: Answer, index: number) => {
			const answerHtml = createHtmlAnswer(
				this,
				this.questionWindow.x - 200 * (index % 2) + 410,
				this.questionWindow.y - 95 + 200 * Math.floor(index / 2),
				150,
				150,
				answer.getId(),
				this.language
			)
				.setDepth(1)
				.setAlpha(0);

			this.answersHtml.push(answerHtml);

			const invisibleDiv = createInvisibleDiv(
				this,
				this.questionWindow.x - 200 * (index % 2) + 410,
				this.questionWindow.y - 95 + 200 * Math.floor(index / 2),
				250,
				80
			).setDepth(2);

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
			let inputValue = (<HTMLInputElement>this.inputHtml.getChildByName("answerField")).value;
			if (this.question.getAnswerType() === "TRUE_OR_FALSE" && (inputValue.toLowerCase() === "vrai" || inputValue.toLowerCase() === "faux")) {
				inputValue = inputValue.toLowerCase() === "vrai" ? "a" : "b";
			}
			answer = this.question.getAnswer(inputValue);
		}
		sceneEvents.emit(EventNames.answerQuestion, answer, this.targetLocation);
	}

	private destroyScene(): void {
		this.scene.stop(CST.SCENES.REPORT_ERROR);
		this.scene.stop(CST.SCENES.QUESTION_WINDOW);
		(<RaceScene>this.scene.get(CST.SCENES.RACE_GAME)).closeWindow();
	}

	private useCrystalBall(): void {
		//TODO: Make constants of the types
		if (this.question.getAnswerType() == "MULTIPLE_CHOICE" || this.question.getAnswerType() == "MULTIPLE_CHOICE_5") {
			if (!this.question.areAllAnswersRight()) {
				try {
					sceneEvents.emit(EventNames.useCrystalBall, ItemType.CrystalBall);
					this.question.removeWrongAnswer();
					this.clearAnswers();
					this.generateHtmlAnswers();
				} catch (error) {
					console.log(error);
				}
			}
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
		(<HTMLInputElement>this.inputHtml.getChildByName("answerField")).style.opacity = "1";
		this.input.enabled = isFromQuestionScene;
		this.resumeGame();
	}

	private handleNewQuestionFound(data: QuestionFoundFromBookEvent) {
		this.newQuestionFound(QuestionMapper.fromDTO(data.questionDTO));
	}
}

export interface QuestionSceneData {
	question: Question;
	targetLocation: Point;
}
