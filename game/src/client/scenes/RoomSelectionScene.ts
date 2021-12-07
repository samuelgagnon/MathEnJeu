import { JoinRoomRequestEvent } from "../../communication/room/EventInterfaces";
import { ROOM_EVENT_NAMES } from "../../communication/room/EventNames";
import { ROOM_SELECTION_EVENT_NAMES } from "../../communication/roomSelection/EventNames";
import { CST } from "../CST";
import { connectToRoomSelectionNamespace } from "../services/RoomService";
import BaseScene from "./BaseScene";
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from "../GameConfig";

export default class RoomSelection extends BaseScene {
	private joinRoomButton: Phaser.GameObjects.Text;
	private backButton: Phaser.GameObjects.Text;
	private inputHtml: Phaser.GameObjects.DOMElement;
	private roomsListHtml: Phaser.GameObjects.DOMElement;
	private refreshButton: Phaser.GameObjects.Text;

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
		this.scale.setGameSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
		this.inputHtml = this.add.dom(600, this.game.renderer.height * 0.5).createFromCache(CST.HTML.ROOM_INPUT);
		this.roomsListHtml = this.add.dom(1000, this.game.renderer.height * 0.3).createFromCache(CST.HTML.ROOMS_LIST);

		this.roomSelectionSocket.on(ROOM_SELECTION_EVENT_NAMES.ROOM_UPDATE, (rooms: string[]) => {
			this.playerListUpdate(rooms);
		});
		document.body.style.backgroundImage = 'url("static/client/assets/images/starfield.png")';
		// this.add.image(Number(this.game.config.width) / 2 + 6, Number(this.game.config.height) / 2 + 18, CST.IMAGES.BACKGROUD).setScale(0.71, 0.713);
		this.joinRoomButton = this.add
			.text(385, this.game.renderer.height * 0.6, "Rejoindre une partie", {
				fontFamily: "ArcherBoldPro",
				fontSize: "64px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

		this.joinRoomButton
			.on("pointerover", () => {
				this.joinRoomButton.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.joinRoomButton.clearTint();
			})
			.on("pointerdown", () => {
				this.joinRoomButton.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.joinRoomButton.clearTint();
				const roomId = (<HTMLInputElement>this.inputHtml.getChildByName("roomField")).value;
				this.gameSocket.emit(ROOM_EVENT_NAMES.JOIN_ROOM_REQUEST, <JoinRoomRequestEvent>{ roomId: roomId });
			});

		this.backButton = this.add
			.text(10, 10, "<- back", {
				fontFamily: "ArcherBoldPro",
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
				this.scene.start(CST.SCENES.ROOM_CREATION);
			});

		this.refreshButton = this.add
			.text(Number(this.game.config.width) * 0.9, 10, "Refresh", {
				fontFamily: "ArcherBoldPro",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

		this.refreshButton
			.on("pointerover", () => {
				this.refreshButton.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.refreshButton.clearTint();
			})
			.on("pointerdown", () => {
				this.refreshButton.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.refreshButton.clearTint();
				this.roomSelectionSocket.emit(ROOM_SELECTION_EVENT_NAMES.UPDATE_REQUEST);
			});
	}

	update() {}

	private playerListUpdate(rooms: string[]) {
		let roomList = <HTMLInputElement>this.roomsListHtml.getChildByID("roomList");

		while (roomList.firstChild) {
			roomList.removeChild(roomList.firstChild);
		}

		rooms.forEach((room) => {
			var li = document.createElement("li");
			li.appendChild(document.createTextNode(room));
			roomList.appendChild(li);
		});
	}
}
