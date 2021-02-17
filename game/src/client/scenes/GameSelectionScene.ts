import { ROOM_EVENT_NAMES } from "../../communication/room/EventNames";
import { Clock } from "../../gameCore/clock/Clock";
import { CST } from "../CST";
import { connectToGameNamespace } from "../services/RoomService";
import { getUserInfo } from "../services/UserInformationService";

export default class GameSelection extends Phaser.Scene {
	private createRoomButton: Phaser.GameObjects.Text;
	private joinRoomButton: Phaser.GameObjects.Text;
	private backButton: Phaser.GameObjects.Text;

	private privateRoomCodeInput: Phaser.GameObjects.DOMElement;

	private gameSocket: SocketIOClient.Socket;

	constructor() {
		const sceneConfig = { key: CST.SCENES.GAME_SELECTION };
		super(sceneConfig);
	}

	init(data: any) {
		if (!!!data.socket) {
			this.gameSocket = connectToGameNamespace(getUserInfo());
			this.gameSocket.once(ROOM_EVENT_NAMES.ROOM_JOINED, () => {
				this.scene.start(CST.SCENES.WAITING_ROOM, { socket: this.gameSocket });
			});

			if (!Clock.getIsSynchronizedWithServer()) {
				Clock.startSynchronizationWithServer(this.gameSocket);
			}
		}
	}

	create() {
		this.privateRoomCodeInput = this.add.dom(this.game.renderer.height * 0.5, this.game.renderer.height * 0.8).createFromCache(CST.HTML.ROOM_INPUT);

		this.add.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD).setOrigin(0).setDepth(0);

		this.createRoomButton = this.add
			.text(this.game.renderer.height * 0.5, this.game.renderer.height * 0.2, "Create Room", {
				fontFamily: "Courier",
				fontSize: "64px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

		this.joinRoomButton = this.add
			.text(this.game.renderer.height * 0.5, this.game.renderer.height * 0.4, "Join Room", {
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
			this.scene.start(CST.SCENES.ROOM_CREATION, { socket: this.gameSocket });
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
			this.scene.start(CST.SCENES.ROOM_SELECTION, { socket: this.gameSocket });
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
			this.scene.start(CST.SCENES.USERS_SETTING);
		});
	}

	update() {}
}
