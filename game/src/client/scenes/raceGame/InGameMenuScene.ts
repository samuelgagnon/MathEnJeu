import { CST } from "../../CST";
import { EventNames, sceneEvents, subscribeToEvent } from "./RaceGameEvents";

export default class InGameMenuScene extends Phaser.Scene {
	position: Point;
	width: number;
	height: number;

	resumeText: Phaser.GameObjects.Text;
	reportProblemText: Phaser.GameObjects.Text;
	quitText: Phaser.GameObjects.Text;

	constructor() {
		const sceneConfig = {
			key: CST.SCENES.IN_GAME_MENU,
		};
		super(sceneConfig);
	}

	init() {
		this.width = Number(this.game.config.width) * 0.4;
		this.height = Number(this.game.config.height) * 0.8;

		var x = Number(this.game.config.width) * 0.35;
		var y = Number(this.game.config.height) * 0.05;
		this.position = { x: x, y: y };
	}

	create() {
		this.cameras.main.setViewport(this.position.x, this.position.y, this.width, this.height);
		this.cameras.main.setBackgroundColor(0x808080);

		this.resumeText = this.add
			.text(this.width / 2 - 75, this.height * 0.3, "Resume", {
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

		this.resumeText
			.on("pointerover", () => {
				this.quitText.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.quitText.clearTint();
			})
			.on("pointerdown", () => {
				this.quitText.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.resumeGame();
			});

		this.reportProblemText = this.add
			.text(this.width / 2 - 75, this.height * 0.5, "Report problem", {
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

		this.reportProblemText
			.on("pointerover", () => {
				this.reportProblemText.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.reportProblemText.clearTint();
			})
			.on("pointerdown", () => {
				this.reportProblemText.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				sceneEvents.emit(EventNames.errorWindowOpened);
				this.scene.launch(CST.SCENES.REPORT_ERROR, {
					questionId: null, //Send null because the error report isn't tied to a question
				});
			});

		this.quitText = this.add
			.text(this.width / 2 - 75, this.height * 0.7, "Quit", {
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

		this.quitText
			.on("pointerover", () => {
				this.quitText.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.quitText.clearTint();
			})
			.on("pointerdown", () => {
				this.quitText.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				sceneEvents.emit(EventNames.quitGame);
			});

		subscribeToEvent(EventNames.errorWindowOpened, this.errorWindowOpened, this);
		subscribeToEvent(EventNames.errorWindowClosed, this.errorWindowClosed, this);
		subscribeToEvent(EventNames.gameEnds, () => this.scene.stop(), this);
	}

	update() {}

	private resumeGame(): void {
		sceneEvents.emit(EventNames.gameResumed);
		this.scene.stop(CST.SCENES.IN_GAME_MENU);
	}

	private errorWindowOpened(): void {
		this.input.enabled = false;
	}

	private errorWindowClosed(): void {
		this.input.enabled = true;
	}
}
