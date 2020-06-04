import { CST } from "../CST";

export default class RoomSelection extends Phaser.Scene {
	private createRoomText: Phaser.GameObjects.Text;
	private joinRoomText: Phaser.GameObjects.Text;

	constructor() {
		const sceneConfig = { key: CST.SCENES.ROOM_SELECTION };
		super(sceneConfig);
	}

	create() {
		this.add
			.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD)
			.setOrigin(0)
			.setDepth(0);

		this.createRoomText = this.add.text(10, this.game.renderer.height * 0.2, "Create Room", {
			fontFamily: "Courier",
			fontSize: "64px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.joinRoomText = this.add.text(10, this.game.renderer.height * 0.4, "Join Room", {
			fontFamily: "Courier",
			fontSize: "64px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.createRoomText.setInteractive({ useHandCursor: true });
		this.joinRoomText.setInteractive({ useHandCursor: true });

		this.createRoomText.on("pointerover", () => {
			this.createRoomText.setTint(0xffff66);
		});

		this.createRoomText.on("pointerout", () => {
			this.createRoomText.clearTint();
		});

		this.createRoomText.on("pointerdown", () => {
			this.createRoomText.setTint(0x86bfda);
		});

		this.createRoomText.on("pointerup", () => {
			this.createRoomText.clearTint();
			this.scene.start(CST.SCENES.MAIN);
		});

		this.joinRoomText.on("pointerover", () => {
			this.joinRoomText.setTint(0xffff66);
		});

		this.joinRoomText.on("pointerout", () => {
			this.joinRoomText.clearTint();
		});

		this.joinRoomText.on("pointerdown", () => {
			this.joinRoomText.setTint(0x86bfda);
		});

		this.joinRoomText.on("pointerup", () => {
			this.joinRoomText.clearTint();
			this.scene.start(CST.SCENES.MAIN);
		});
	}
}
