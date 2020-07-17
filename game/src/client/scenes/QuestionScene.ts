import { CST } from "./../CST";
import RaceScene from "./RaceScene";
export default class QuestionScene extends Phaser.Scene {
	position: Point;
	width: number;
	height: number;
	targetLocation: Point;

	yesText: Phaser.GameObjects.Text;
	noText: Phaser.GameObjects.Text;

	constructor() {
		const sceneConfig = { key: CST.SCENES.QUESTION_WINDOW };
		super(sceneConfig);
	}

	init(data: any) {
		this.targetLocation = data.targetLocation;
		this.width = data.width;
		this.height = data.height;
		this.position = data.position;
	}

	create() {
		this.cameras.main.setViewport(this.position.x, this.position.y, this.width, this.height);
		this.cameras.main.setBackgroundColor(0xffffff);

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
	}

	update() {}

	private answerQuestion(answer: boolean) {
		(<RaceScene>this.scene.get(CST.SCENES.RACE_GAME)).answerQuestion(answer, this.targetLocation);
		this.scene.stop(CST.SCENES.QUESTION_WINDOW);
	}
}
