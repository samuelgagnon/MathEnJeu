import { Question } from "../../gameCore/race/question/Question";
import { getBase64ImageForQuestion } from "../services/QuestionsService";
import { getUserInfo } from "../services/UserInformationService";
import { CST } from "./../CST";
import RaceScene from "./RaceScene";
export default class QuestionScene extends Phaser.Scene {
	position: Point;
	width: number;
	height: number;
	targetLocation: Point;
	question: Question;

	questionImage: Phaser.GameObjects.Image;
	questionTexture: Phaser.Textures.Texture;

	yesText: Phaser.GameObjects.Text;
	noText: Phaser.GameObjects.Text;

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
	}

	create() {
		this.cameras.main.setViewport(this.position.x, this.position.y, this.width, this.height);
		this.cameras.main.setBackgroundColor(0xffffff);

		this.textures.once(
			"addtexture",
			() => {
				this.questionImage = this.add.image(this.width * 0.5, this.height * 0.3, "question").setScale(0.3);

				this.yesText = this.add
					.text(this.width * 0.6, this.height * 0.8, "yes", {
						fontFamily: "Courier",
						fontSize: "32px",
						align: "center",
						color: "#000000",
						fontStyle: "bold",
					})
					.setScrollFactor(0);

				this.noText = this.add
					.text(this.width * 0.4, this.height * 0.8, "no", {
						fontFamily: "Courier",
						fontSize: "32px",
						align: "center",
						color: "#000000",
						fontStyle: "bold",
					})
					.setScrollFactor(0);

				this.yesText.setInteractive({
					useHandCursor: true,
				});
				this.noText.setInteractive({
					useHandCursor: true,
				});

				this.yesText.on("pointerup", () => {
					this.answerQuestion(true);
				});
				this.noText.on("pointerup", () => {
					this.answerQuestion(false);
				});
			},
			this
		);

		const userInfo = getUserInfo();
		getBase64ImageForQuestion(this.question.getId(), userInfo.language, userInfo.schoolGrade).then((value) => {
			this.textures.addBase64("question", value);
		});
	}

	update() {}

	private answerQuestion(answer: boolean) {
		this.questionImage.destroy();
		this.textures.remove("question");
		this.scene.stop(CST.SCENES.QUESTION_WINDOW);
		(<RaceScene>this.scene.get(CST.SCENES.RACE_GAME)).answerQuestion(answer, this.targetLocation);
	}
}

export interface QuestionSceneData {
	question: Question;
	targetLocation: Point;
	position: Point;
	width: number;
	height: number;
}
