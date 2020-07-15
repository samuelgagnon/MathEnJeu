import { CST } from "./../CST";
export default class QuestionScene extends Phaser.Scene {
	parent: Phaser.GameObjects.Zone;
	width: number;
	height: number;
	targetLocation: Point;

	yesText: Phaser.GameObjects.Text;
	noText: Phaser.GameObjects.Text;

	constructor(parent: Phaser.GameObjects.Zone, targetLocation: Point) {
		const sceneConfig = { key: CST.SCENES.QUESTION_WINDOW };
		super(sceneConfig);
		this.parent = parent;
		this.width = parent.width;
		this.height = parent.height;
		this.targetLocation = targetLocation;
	}

	preload() {}

	create() {
		this.cameras.main.setViewport(this.parent.x, this.parent.y, this.width, this.height);
		this.cameras.main.setBackgroundColor(0xffffff);

		this.yesText = this.add
			.text(this.parent.width * 0.6, this.parent.height * 0.8, "yes", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#000000",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.noText = this.add
			.text(this.parent.width * 0.4, this.parent.height * 0.8, "no", {
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

	refresh() {
		this.cameras.main.setPosition(this.parent.x, this.parent.y);

		this.scene.bringToTop();
	}

	update() {}

	private answerQuestion(correctAnswer: boolean) {
		//@ts-ignore
		this.scene.get(CST.SCENES.RACEGAME).answerQuestion(correctAnswer, this.targetLocation);
		this.scene.remove(CST.SCENES.QUESTION_WINDOW);
	}
}
