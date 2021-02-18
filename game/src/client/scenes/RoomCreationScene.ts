import { CST } from "../CST";
import { createRoom } from "../services/RoomService";
import BaseSocketScene from "./BaseSocketScene";

export default class RoomCreation extends BaseSocketScene {
	private createRoomButton: Phaser.GameObjects.Text;
	private backButton: Phaser.GameObjects.Text;

	private roomSettings: Phaser.GameObjects.DOMElement;

	constructor() {
		const sceneConfig = { key: CST.SCENES.ROOM_CREATION };
		super(sceneConfig);
	}

	init(data: any) {
		super.init(data);
	}

	create() {
		this.add.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD).setOrigin(0).setDepth(0);
		this.roomSettings = this.add.dom(this.game.renderer.height * 0.5, this.game.renderer.height * 0.5).createFromCache(CST.HTML.ROOM_SETTINGS);

		this.createRoomButton = this.add
			.text(this.game.renderer.height * 0.7, this.game.renderer.height * 0.8, "Create Room", {
				fontFamily: "Courier",
				fontSize: "64px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

		this.backButton = this.add
			.text(10, 10, "<- back", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

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
			const numberOfPlayers = Number((<HTMLInputElement>this.roomSettings.getChildByID("nbPlayers")).value);
			const isPrivate = (<HTMLInputElement>this.roomSettings.getChildByID("isPrivate")).checked;
			createRoom(this.gameSocket, { isPrivate, numberOfPlayers });
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
			this.scene.start(CST.SCENES.GAME_SELECTION);
		});
	}

	update() {}
}
