import { CST } from "../CST";
import { joinRoom } from "../services/RoomService";
import BaseScene from "./BaseScene";

export default class GameSelection extends BaseScene {
	private createRoomButton: Phaser.GameObjects.Text;
	private publicRoomsButton: Phaser.GameObjects.Text;
	private joinPrivateRoomButton: Phaser.GameObjects.Text;
	private backButton: Phaser.GameObjects.Text;

	private gameSocket: SocketIOClient.Socket;

	private privateRoomCodeInput: Phaser.GameObjects.DOMElement;

	constructor() {
		const sceneConfig = { key: CST.SCENES.GAME_SELECTION };
		super(sceneConfig);
	}

	init(data: any) {
		this.gameSocket = this.initializeSocket();
	}

	create() {
		this.privateRoomCodeInput = this.add.dom(this.game.renderer.width * 0.4, this.game.renderer.height * 0.7).createFromCache(CST.HTML.ROOM_INPUT);

		this.add.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD).setOrigin(0).setDepth(0);

		this.createRoomButton = this.add
			.text(this.game.renderer.width * 0.38, this.game.renderer.height * 0.2, "Create Room", {
				fontFamily: "Courier",
				fontSize: "64px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

		this.createRoomButton
			.on("pointerover", () => {
				this.createRoomButton.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.createRoomButton.clearTint();
			})
			.on("pointerdown", () => {
				this.createRoomButton.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.createRoomButton.clearTint();
				this.scene.start(CST.SCENES.ROOM_CREATION);
			});

		this.publicRoomsButton = this.add
			.text(this.game.renderer.width * 0.38, this.game.renderer.height * 0.4, "Public Rooms", {
				fontFamily: "Courier",
				fontSize: "64px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

		this.publicRoomsButton
			.on("pointerover", () => {
				this.publicRoomsButton.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.publicRoomsButton.clearTint();
			})
			.on("pointerdown", () => {
				this.publicRoomsButton.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.publicRoomsButton.clearTint();
				this.scene.start(CST.SCENES.ROOM_SELECTION);
			});

		this.joinPrivateRoomButton = this.add
			.text(this.game.renderer.width * 0.6, this.game.renderer.height * 0.66, "Join Room", {
				fontFamily: "Courier",
				fontSize: "64px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

		this.joinPrivateRoomButton
			.on("pointerover", () => {
				this.joinPrivateRoomButton.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.joinPrivateRoomButton.clearTint();
			})
			.on("pointerdown", () => {
				this.joinPrivateRoomButton.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.joinPrivateRoomButton.clearTint();
				const roomId = (<HTMLInputElement>this.privateRoomCodeInput.getChildByName("roomField")).value;
				joinRoom(this.gameSocket, roomId);
			});

		this.backButton = this.add
			.text(10, 10, "<- back", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

		this.backButton
			.on("pointerover", () => {
				this.backButton.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.backButton.clearTint();
			})
			.on("pointerdown", () => {
				this.backButton.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.backButton.clearTint();
				this.scene.start(CST.SCENES.USERS_SETTING);
			});
	}

	update() {}
}
