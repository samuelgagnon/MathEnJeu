import { Question } from "../../gameCore/race/question/Question";
import { getBase64ImageForQuestion, getBase64ImageForQuestionFeedback } from "../services/QuestionsService";
import { getUserInfo } from "../services/UserInformationService";
import { CST } from "./../CST";
import RaceScene from "./RaceScene";
export default class QuestionScene extends Phaser.Scene {
	position: Point;
	width: number;
	height: number;
	targetLocation: Point;
	question: Question;

	feedbackImage: Phaser.GameObjects.Image;
	questionImage: Phaser.GameObjects.Image;
	questionTexture: Phaser.Textures.Texture;

	enterButton: Phaser.GameObjects.Text;
	inputHtml: Phaser.GameObjects.DOMElement;

	feedbackMaxTime: number;
	feedbackStartTimeStamp: number;
	feedbackRemainingTime: Phaser.GameObjects.Text;

	constructor() {
		const sceneConfig = { key: CST.SCENES.QUESTION_WINDOW };
		super(sceneConfig);
	}

	init(data: QuestionSceneData) {
		this.question = data.question;
		this.targetLocation = data.targetLocation;
		this.width = data.width;
		this.height = data.height;
		this.position = data.position;
		this.feedbackMaxTime = 5000;
	}

	create() {
		this.cameras.main.setViewport(this.position.x, this.position.y, this.width, this.height);
		this.cameras.main.setBackgroundColor(0xffffff);

		this.textures.on(
			"addtexture",
			(textureId: string) => {
				if (textureId === "question") {
					this.questionImage = this.add.image(this.width * 0.5, this.height * 0.35, "question").setScale(0.3);
					console.log(`width: ${this.questionImage.displayWidth},  height: ${this.questionImage.displayHeight}`);
					if (this.questionImage.displayHeight > 500 && this.questionImage.displayHeight < 800) this.questionImage.setScale(0.2);
					if (this.questionImage.displayHeight >= 800) this.questionImage.setScale(0.15);
					this.inputHtml = this.add.dom(this.width * 0.4, this.height * 0.85).createFromCache(CST.HTML.ANSWER_INPUT);

					this.enterButton = this.add
						.text(this.width * 0.6, this.height * 0.85, "enter", {
							fontFamily: "Courier",
							fontSize: "32px",
							align: "center",
							color: "#000000",
							fontStyle: "bold",
						})
						.setScrollFactor(0);

					this.enterButton.setInteractive({
						useHandCursor: true,
					});

					this.enterButton.on("pointerup", () => {
						this.answerQuestion();
					});
				} else if (textureId === "feedback") {
					this.feedbackImage = this.add
						.image(this.width * 0.5, this.height * 0.35, "feedback")
						.setScale(0.3)
						.setAlpha(0);
					if (this.feedbackImage.displayHeight > 500 && this.questionImage.displayHeight < 800) this.questionImage.setScale(0.2);
					if (this.feedbackImage.displayHeight >= 800) this.questionImage.setScale(0.15);
				}
			},
			this
		);

		const userInfo = getUserInfo();
		getBase64ImageForQuestion(this.question.getId(), userInfo.language, userInfo.schoolGrade).then((value) => {
			this.textures.addBase64("question", value);
		});

		getBase64ImageForQuestionFeedback(this.question.getId(), userInfo.language, userInfo.schoolGrade).then((value) => {
			this.textures.addBase64("feedback", value);
		});
	}

	update() {
		if (this.feedbackStartTimeStamp !== undefined) {
			this.feedbackRemainingTime.setText(Math.ceil((this.feedbackStartTimeStamp - Date.now() + this.feedbackMaxTime) / 1000).toString());
		}
	}

	private answerQuestion(): void {
		const isAnswerCorrect = this.question.IsAnswerRight((<HTMLInputElement>this.inputHtml.getChildByName("answerField")).value);
		if (!isAnswerCorrect) {
			this.inputHtml.destroy();
			this.enterButton.destroy();
			this.feedbackStartTimeStamp = Date.now();

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
			setTimeout(() => {
				this.destroyScene(isAnswerCorrect);
			}, this.feedbackMaxTime);
		} else {
			this.destroyScene(isAnswerCorrect);
		}
	}

	private destroyScene(isAnswerCorrect: boolean): void {
		this.questionImage.destroy();
		this.textures.remove("question");
		this.textures.remove("feedback");
		this.scene.stop(CST.SCENES.QUESTION_WINDOW);
		(<RaceScene>this.scene.get(CST.SCENES.RACE_GAME)).answerQuestion(isAnswerCorrect, this.targetLocation);
	}
}

export interface QuestionSceneData {
	question: Question;
	targetLocation: Point;
	position: Point;
	width: number;
	height: number;
}
