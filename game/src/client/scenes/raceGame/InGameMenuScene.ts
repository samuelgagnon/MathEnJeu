import { getTranslate } from "../../assets/locales/translate";
import { CST } from "../../CST";
import { EventNames, sceneEvents, subscribeToEvent } from "./RaceGameEvents";
import RaceGameUI from "./RaceGameUI";
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from "../../GameConfig";
export default class InGameMenuScene extends Phaser.Scene {
	position: Point;
	width: number;
	height: number;

	resumeText: Phaser.GameObjects.Rectangle;
	reportProblemText: Phaser.GameObjects.Rectangle;
	quitText: Phaser.GameObjects.Rectangle;
	inGameBack: Phaser.GameObjects.Image;

	constructor() {
		const sceneConfig = {
			key: CST.SCENES.IN_GAME_MENU,
		};
		super(sceneConfig);
	}

	init() {
		this.width = Number(this.game.config.width) * 0.4;
		this.height = Number(this.game.config.height) * 0.8;

		var x = Number(this.game.config.width) * 0.35; // width * 0.35; //
		var y = Number(this.game.config.height) * 0.05; //height * 0.05; //
		this.position = { x: x, y: y };
	}

	create() {
		// this.scale.setGameSize(window.innerWidth, window.innerHeight);
		this.inGameBack = this.add.image(Number(this.game.config.width) / 2, Number(this.game.config.height) / 2, CST.IMAGES.IN_GAME_BACK).setScale(0.9);
		this.resumeText = this.add.rectangle(this.inGameBack.x + 320, this.inGameBack.y - 148, 35, 35).setInteractive({ useHandCursor: true });
		this.resumeText.on("pointerup", () => {
			this.resumeGame();
		});

		var reportProblem = this.add.text(this.inGameBack.x, this.inGameBack.y - 43, getTranslate("inGameMenu.reportProblem"), {
			fontFamily: "ArcherBoldPro",
			fontSize: "18px",
			align: "center",
			color: "#fff",
			fontStyle: "bold",
		});
		reportProblem.setX(reportProblem.x - reportProblem.width / 2);
		this.reportProblemText = this.add.rectangle(this.inGameBack.x + 0, this.inGameBack.y - 30, 310, 48).setInteractive({ useHandCursor: true });
		this.reportProblemText
			.on("pointerover", () => {
				reportProblem.setTint(0xffff66);
			})
			.on("pointerout", () => {
				reportProblem.clearTint();
			})
			.on("pointerdown", () => {
				reportProblem.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				sceneEvents.emit(EventNames.errorWindowOpened);
				this.scene.launch(CST.SCENES.REPORT_ERROR, {
					questionId: null, //Send null because the error report isn't tied to a question
				});
			});

		var exitGame = this.add.text(this.inGameBack.x, this.inGameBack.y + 32, getTranslate("inGameMenu.returnToGame"), {
			fontFamily: "ArcherBoldPro",
			fontSize: "22px",
			align: "center",
			color: "#fff",
			fontStyle: "bold",
		});
		exitGame.setX(exitGame.x - exitGame.width / 2);

		this.quitText = this.add.rectangle(this.inGameBack.x + 3, this.inGameBack.y + 45, 310, 43).setInteractive({ useHandCursor: true });
		this.quitText
			.on("pointerover", () => {
				exitGame.setTint(0xffff66);
			})
			.on("pointerout", () => {
				exitGame.clearTint();
			})
			.on("pointerdown", () => {
				exitGame.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				exitGame.clearTint();
				sceneEvents.emit(EventNames.quitGame);
				(<RaceGameUI>this.scene.get(CST.SCENES.RACE_GAME_UI)).closeGame();
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
