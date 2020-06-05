import { CST } from "../CST";

export default class WaitingRoomScene extends Phaser.Scene {
	private startButton: Phaser.GameObjects.Text;

	constructor() {
		const sceneConfig = { key: CST.SCENES.WAITING_ROOM };
		super(sceneConfig);
	}

	init() {}

	create() {
		this.add
			.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD)
			.setOrigin(0)
			.setDepth(0);

		this.startButton = this.add.text(this.game.renderer.width * 0.65, this.game.renderer.height * 0.85, "Start Game", {
			fontFamily: "Courier",
			fontSize: "50px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.startButton.setInteractive({ useHandCursor: true });

		this.startButton.on("pointerover", () => {
			this.startButton.setTint(0xffff66);
		});

		this.startButton.on("pointerout", () => {
			this.startButton.clearTint();
		});

		this.startButton.on("pointerdown", () => {
			this.startButton.setTint(0x86bfda);
		});

		this.startButton.on("pointerup", () => {
			this.startButton.clearTint();
			this.scene.start(CST.SCENES.MENU);
		});
	}
}
