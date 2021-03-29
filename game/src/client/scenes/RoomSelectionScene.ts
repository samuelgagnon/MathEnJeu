import { JoinRoomRequestEvent } from "../../communication/room/EventInterfaces";
import { ROOM_EVENT_NAMES } from "../../communication/room/EventNames";
import { CST } from "../CST";
import { connectToRoomSelectionNamespace } from "../services/RoomService";
import BaseScene from "./BaseScene";

export default class RoomSelection extends BaseScene {
	private joinRoomButton: Phaser.GameObjects.Text;
	private backButton: Phaser.GameObjects.Text;
	private inputHtml: Phaser.GameObjects.DOMElement;
	private roomsListHtml: Phaser.GameObjects.DOMElement;

	private gameSocket: SocketIOClient.Socket;

	private roomSelectionSocket: SocketIOClient.Socket;

	constructor() {
		const sceneConfig = { key: CST.SCENES.ROOM_SELECTION };
		super(sceneConfig);
	}

	init(data: any) {
		this.gameSocket = this.initializeSocket();

		this.roomSelectionSocket = connectToRoomSelectionNamespace();
		this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			this.roomSelectionSocket.close();
		});
	}

	create() {
		this.inputHtml = this.add.dom(600, this.game.renderer.height * 0.5).createFromCache(CST.HTML.ROOM_INPUT);
		this.roomsListHtml = this.add.dom(1000, this.game.renderer.height * 0.3).createFromCache(CST.HTML.ROOMS_LIST);

		this.roomSelectionSocket.on("room-update", (rooms: []) => {
			let roomList = <HTMLInputElement>this.roomsListHtml.getChildByID("roomList");

			while (roomList.firstChild) {
				roomList.removeChild(roomList.firstChild);
			}

			rooms.forEach((room) => {
				var li = document.createElement("li");
				li.appendChild(document.createTextNode(room));
				roomList.appendChild(li);
			});
		});

		this.add.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD).setOrigin(0).setDepth(0);

		this.joinRoomButton = this.add
			.text(385, this.game.renderer.height * 0.6, "Join Room", {
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

		this.joinRoomButton.on("pointerout", () => {
			this.joinRoomButton.clearTint();
		});

		this.joinRoomButton.on("pointerdown", () => {
			this.joinRoomButton.setTint(0x86bfda);
		});

		this.joinRoomButton.on("pointerup", () => {
			this.joinRoomButton.clearTint();
			const roomId = (<HTMLInputElement>this.inputHtml.getChildByName("roomField")).value;
			this.gameSocket.emit(ROOM_EVENT_NAMES.JOIN_ROOM_REQUEST, <JoinRoomRequestEvent>{ roomId: roomId });
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
