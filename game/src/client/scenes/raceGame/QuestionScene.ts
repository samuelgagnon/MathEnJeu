import { QuestionFoundFromBookEvent } from "../../../communication/race/DataInterfaces";
import { Clock } from "../../../gameCore/clock/Clock";
import { Answer } from "../../../gameCore/race/question/Answer";
import { Question } from "../../../gameCore/race/question/Question";
import QuestionMapper from "../../../gameCore/race/question/QuestionMapper";
import { CST } from "../../CST";
import { getBase64ImageForQuestion, getBase64ImageForQuestionFeedback } from "../../services/QuestionsService";
import { getUserInfo } from "../../services/UserInformationService";
import { EventNames, sceneEvents } from "./RaceGameEvents";
import RaceScene from "./RaceScene";
export default class QuestionScene extends Phaser.Scene {
	position: Point;
	width: number;
	height: number;
	sizeFactor: number;
	targetLocation: Point;
	question: Question;
	questionConstant: string;
	feedbackConstant: string;

	feedbackImage: Phaser.GameObjects.Image;
	questionImage: Phaser.GameObjects.Image;
	questionTexture: Phaser.Textures.Texture;

	enterButton: Phaser.GameObjects.Text;
	correctAnswer: Phaser.GameObjects.Text;
	inputHtml: Phaser.GameObjects.DOMElement;
	answersList: Phaser.GameObjects.DOMElement;
	reportProblemButton: Phaser.GameObjects.Text;

	bookIcon: Phaser.GameObjects.Sprite;
	crystalBallIcon: Phaser.GameObjects.Sprite;
	bookCount: Phaser.GameObjects.Text;
	crystalBallCount: Phaser.GameObjects.Text;

	feedbackMaxTime: number;
	feedbackStartTimeStamp: number;
	feedbackRemainingTime: Phaser.GameObjects.Text;
	showFeedbackTime: boolean;

	constructor() {
		const sceneConfig = { key: CST.SCENES.QUESTION_WINDOW };
		super(sceneConfig);
	}

	init(data: QuestionSceneData) {
		this.question = data.question;
		this.targetLocation = data.targetLocation;
		this.feedbackMaxTime = 5000;
		this.showFeedbackTime = false;
		this.questionImage = undefined;
		this.feedbackImage = undefined;
		this.feedbackConstant = "feedback";
		this.questionConstant = "question";

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
		this.answersList = this.add.dom(this.width * 0.8, this.height * 0.6).createFromCache(CST.HTML.ANSWERS_LIST);

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

		this.correctAnswer.on("pointerup", () => {
			this.destroyScene(this.question.getRightAnswer());
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

		this.textures.on(
			"addtexture",
			(textureId: string) => {
				if (textureId === this.questionConstant && !this.questionImage) {
					this.questionImage = this.add.image(this.width * 0.5, this.height * 0.35, this.questionConstant).setScale(0.3);
					if (this.questionImage.displayHeight > 500 && this.questionImage.displayHeight < 800) this.questionImage.setScale(0.2);
					if (this.questionImage.displayHeight >= 800) this.questionImage.setScale(0.15);
				} else if (textureId === this.feedbackConstant && !this.feedbackImage) {
					this.feedbackImage = this.add
						.image(this.width * 0.5, this.height * 0.35, this.feedbackConstant)
						.setScale(0.3)
						.setAlpha(0);
					if (this.feedbackImage.displayHeight > 500 && this.questionImage.displayHeight < 800) this.questionImage.setScale(0.2);
					if (this.feedbackImage.displayHeight >= 800) this.questionImage.setScale(0.15);
				}
			},
			this
		);

		this.getTexturesForQuestion();

		sceneEvents.on(EventNames.gameResumed, this.resumeGame, this);
		sceneEvents.on(EventNames.gamePaused, this.pauseGame, this);
		sceneEvents.on(EventNames.errorWindowClosed, this.errorWindowClosed, this);
		sceneEvents.on(EventNames.errorWindowOpened, this.pauseGame, this);
		sceneEvents.on(EventNames.newQuestionFound, this.handleNewQuestionFound, this);

		this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			this.clearQuestionTextures();
			sceneEvents.off(EventNames.gameResumed, this.resumeGame, this);
			sceneEvents.off(EventNames.gamePaused, this.pauseGame, this);
			sceneEvents.off(EventNames.errorWindowClosed, this.errorWindowClosed, this);
			sceneEvents.off(EventNames.errorWindowOpened, this.pauseGame, this);
			sceneEvents.off(EventNames.newQuestionFound, this.handleNewQuestionFound, this);
		});
	}

	update() {
		if (this.showFeedbackTime) {
			this.feedbackRemainingTime.setText(Math.ceil((this.feedbackStartTimeStamp - Clock.now() + this.feedbackMaxTime) / 1000).toString());
		}

		if (this.question.getAnswerType() == "MULTIPLE_CHOICE" || this.question.getAnswerType() == "MULTIPLE_CHOICE_5") {
			let answersList = <HTMLInputElement>this.answersList.getChildByID("answersList");

			while (answersList.firstChild) {
				answersList.removeChild(answersList.firstChild);
			}

			this.question.getDTO().answers.forEach((answer) => {
				var li = document.createElement("li");
				li.appendChild(document.createTextNode(answer.label));
				answersList.appendChild(li);
			});
		}

		const inventoryState = (<RaceScene>this.scene.get(CST.SCENES.RACE_GAME)).raceGame.getCurrentPlayer().getInventory().getInventoryState();
		this.bookCount.setText(inventoryState.bookCount.toString());
		this.crystalBallCount.setText(inventoryState.crystalBallCount.toString());
	}

	private getTexturesForQuestion(): void {
		const userInfo = getUserInfo();
		getBase64ImageForQuestion(this.question.getId(), userInfo.language, userInfo.schoolGrade).then((value) => {
			this.textures.addBase64(this.questionConstant, value);
		});

		getBase64ImageForQuestionFeedback(this.question.getId(), userInfo.language, userInfo.schoolGrade).then((value) => {
			this.textures.addBase64(this.feedbackConstant, value);
		});
	}

	private answerQuestion(): void {
		const answer = this.question.getAnswer((<HTMLInputElement>this.inputHtml.getChildByName("answerField")).value);
		if (!answer.isRight()) {
			this.inputHtml.setAlpha(0);
			this.enterButton.setAlpha(0);
			this.answersList.setAlpha(0);
			this.correctAnswer.setAlpha(0);
			this.feedbackStartTimeStamp = Clock.now();

			this.feedbackRemainingTime = this.add
				.text(this.width * 0.8, this.height * 0.1, this.feedbackMaxTime.toString(), {
					fontFamily: "Courier",
					fontSize: "26px",
					align: "center",
					color: "#cc0000",
					fontStyle: "bold",
				})
				.setScrollFactor(0);
			this.feedbackImage.setAlpha(1);

			this.showFeedbackTime = true;
			setTimeout(() => {
				this.destroyScene(answer);
			}, this.feedbackMaxTime);
		} else {
			this.destroyScene(answer);
		}
	}

	private destroyScene(answer: Answer): void {
		this.scene.stop(CST.SCENES.REPORT_ERROR);
		this.scene.stop(CST.SCENES.QUESTION_WINDOW);
		(<RaceScene>this.scene.get(CST.SCENES.RACE_GAME)).answerQuestion(this.question.getId(), answer, this.targetLocation);
	}

	private useCrystalBall(): void {
		//TODO: Make constants of the types
		if (this.question.getAnswerType() == "MULTIPLE_CHOICE" || this.question.getAnswerType() == "MULTIPLE_CHOICE_5") {
			try {
				sceneEvents.emit(EventNames.useCrystalBall);
				this.question.removeWrongAnswer();
			} catch (error) {
				console.log(error);
			}
		} else {
			alert("must be a multiple choice question");
		}
	}

	private newQuestionFound(question: Question): void {
		this.clearQuestionTextures();
		this.destroyImages();
		this.question = question;
		this.getTexturesForQuestion();
	}

	private clearQuestionTextures(): void {
		if (this.textures.exists(this.questionConstant)) this.textures.remove(this.questionConstant);
		if (this.textures.exists(this.feedbackConstant)) this.textures.remove(this.feedbackConstant);
	}

	private destroyImages(): void {
		this.questionImage.destroy();
		this.feedbackImage.destroy();
		this.questionImage = undefined;
		this.feedbackImage = undefined;
	}

	private pauseGame() {
		this.inputHtml.setActive(false).setVisible(false);
		this.answersList.setActive(false).setVisible(false);
		this.input.enabled = false;
	}

	private resumeGame() {
		this.inputHtml.setActive(true).setVisible(true);
		this.answersList.setActive(true).setVisible(true);
		this.input.enabled = true;
	}

	private errorWindowClosed(isFromQuestionScene: boolean) {
		this.inputHtml.setActive(isFromQuestionScene).setVisible(isFromQuestionScene);
		this.answersList.setActive(isFromQuestionScene).setVisible(isFromQuestionScene);
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
