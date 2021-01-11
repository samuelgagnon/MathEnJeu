import { CST } from "../CST";
import RaceGameUI from "./RaceGameUI";
import RaceScene from "./RaceScene";

export default class InGameMenuScene extends Phaser.Scene {
	position: Point;
	width: number;
	height: number;
	sizeFactor: number;

	resumeText: Phaser.GameObjects.Text;
	quitText: Phaser.GameObjects.Text;

	disabledInteractionZone: Phaser.GameObjects.Zone;

	constructor() {
		const sceneConfig = {
			key: CST.SCENES.IN_GAME_MENU,
		};
		super(sceneConfig);
	}

	init() {
		this.sizeFactor = 0.9;
		this.width = Number(this.game.config.width) * 0.4;
		this.height = Number(this.game.config.height) * 0.8;

		var x = Number(this.game.config.width) * 0.35;
		var y = Number(this.game.config.height) * 0.05;
		this.position = { x: x, y: y };
	}

	create() {
		const raceScene = <RaceScene>this.scene.get(CST.SCENES.RACE_GAME);
		this.cameras.main.setViewport(this.position.x, this.position.y, this.width, this.height);
		this.cameras.main.setBackgroundColor(0x808080);

		this.resumeText = this.add
			.text(this.width / 2 - 50, this.height * 0.3, "Resume", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#000000",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.quitText = this.add
			.text(this.width / 2 - 50, this.height * 0.5, "Quit", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#000000",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.resumeText.on("pointerover", () => {
			this.quitText.setTint(0xffff66);
		});

		this.resumeText.on("pointerout", () => {
			this.quitText.clearTint();
		});

		this.resumeText.on("pointerdown", () => {
			this.quitText.setTint(0x86bfda);
		});

		this.resumeText.on("pointerup", () => {
			this.resumeGame();
		});

		this.quitText.on("pointerover", () => {
			this.quitText.setTint(0xffff66);
		});

		this.quitText.on("pointerout", () => {
			this.quitText.clearTint();
		});

		this.quitText.on("pointerdown", () => {
			this.quitText.setTint(0x86bfda);
		});

		this.quitText.on("pointerup", () => {
			this.quitGame();
		});

		this.resumeText.setInteractive({
			useHandCursor: true,
		});

		this.quitText.setInteractive({
			useHandCursor: true,
		});
	}

	private quitGame(): void {
		this.scene.stop(CST.SCENES.IN_GAME_MENU);
		this.scene.stop(CST.SCENES.RACE_GAME_UI);
		this.scene.stop(CST.SCENES.QUESTION_WINDOW);
		(<RaceScene>this.scene.get(CST.SCENES.RACE_GAME)).quitGame();
		this.scene.stop(CST.SCENES.RACE_GAME);
		this.scene.start(CST.SCENES.ROOM_SELECTION);
	}

	private resumeGame(): void {
		(<RaceGameUI>this.scene.get(CST.SCENES.RACE_GAME_UI)).resumeGame();
		this.scene.stop(CST.SCENES.IN_GAME_MENU);
	}
}
