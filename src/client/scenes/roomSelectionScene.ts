import { CST } from "../CST";

export default class RoomSelection extends Phaser.Scene {
	private createRoomButton: Phaser.GameObjects.Text;
	private joinRoomButton: Phaser.GameObjects.Text;
	private backButton: Phaser.GameObjects.Text;

	constructor() {
		const sceneConfig = { key: CST.SCENES.ROOM_SELECTION };
		super(sceneConfig);
	}

	preload() {}

	create() {
		this.add
			.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD)
			.setOrigin(0)
			.setDepth(0);

		this.createRoomButton = this.add.text(10, this.game.renderer.height * 0.2, "Create Room", {
			fontFamily: "Courier",
			fontSize: "64px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.joinRoomButton = this.add.text(10, this.game.renderer.height * 0.4, "Join Room", {
			fontFamily: "Courier",
			fontSize: "64px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.backButton = this.add.text(10, 10, "<- back", {
			fontFamily: "Courier",
			fontSize: "32px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.createRoomButton.setInteractive({ useHandCursor: true });
		this.joinRoomButton.setInteractive({ useHandCursor: true });
		this.backButton.setInteractive({ useHandCursor: true });

		this.createRoomButton.on("pointerover", () => {
			this.createRoomButton.setTint(0xffff66);
		});

		this.createRoomButton.on("pointerout", () => {
			this.createRoomButton.clearTint();
		});

		this.createRoomButton.on("pointerdown", () => {
			this.createRoomButton.setTint(0x86bfda);
		});

		this.createRoomButton.on("pointerup", () => {
			this.createRoomButton.clearTint();
			this.scene.start(CST.SCENES.WAITING_ROOM);
		});

		this.joinRoomButton.on("pointerover", () => {
			this.joinRoomButton.setTint(0xffff66);
		});

		this.joinRoomButton.on("pointerout", () => {
			this.joinRoomButton.clearTint();
		});

		this.joinRoomButton.on("pointerdown", () => {
			this.joinRoomButton.setTint(0x86bfda);
		});

		this.joinRoomButton.on("pointerup", () => {
			this.joinRoomButton.clearTint();
			this.scene.start(CST.SCENES.WAITING_ROOM);
		});

		this.backButton.on("pointerover", () => {
			this.backButton.setTint(0xffff66);
		});

		this.backButton.on("pointerout", () => {
			this.backButton.clearTint();
		});

		this.backButton.on("pointerdown", () => {
			this.backButton.setTint(0x86bfda);
		});

		this.backButton.on("pointerup", () => {
			this.backButton.clearTint();
			this.scene.start(CST.SCENES.MENU);
		});
	}

	update() {}
}
