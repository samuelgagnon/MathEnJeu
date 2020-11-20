import { CST } from "../CST";

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
		this.disabledInteractionZone = this.add
			.zone(0, 0, Number(this.game.config.width), Number(this.game.config.height))
			.setInteractive()
			.setOrigin(0)
			.setScrollFactor(0)
			.setActive(true)
			.setVisible(true);

		this.cameras.main.setViewport(this.position.x, this.position.y, this.width, this.height);
		this.cameras.main.setBackgroundColor(0xffffff);

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
			this.destroyScene();
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
			this.destroyScene();
		});

		this.resumeText.setInteractive({
			useHandCursor: true,
		});

		this.quitText.setInteractive({
			useHandCursor: true,
		});
	}

	private destroyScene(): void {
		this.scene.stop(CST.SCENES.IN_GAME_MENU);
	}
}
