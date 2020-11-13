import { Clock } from "../../gameCore/clock/Clock";
import { CST } from "../CST";
import { getUserInfo } from "../services/UserInformationService";
import { connectToGameNamespace, connectToRoomSelectionNamespace, createRoom } from "./../services/RoomService";

export default class RoomSelection extends Phaser.Scene {
	private createRoomButton: Phaser.GameObjects.Text;
	private joinRoomButton: Phaser.GameObjects.Text;
	private backButton: Phaser.GameObjects.Text;
	private inputHtml: Phaser.GameObjects.DOMElement;
	private roomsListHtml: Phaser.GameObjects.DOMElement;

	private roomSelectionSocket: SocketIOClient.Socket;
	private gameSocket: SocketIOClient.Socket;

	constructor() {
		const sceneConfig = { key: CST.SCENES.ROOM_SELECTION };
		super(sceneConfig);
	}

	init() {
		this.roomSelectionSocket = connectToRoomSelectionNamespace();
		this.gameSocket = connectToGameNamespace(getUserInfo());
		if (!Clock.getIsSynchronizedWithServer()) {
			Clock.startSynchronizationWithServer(this.gameSocket);
		}
		this.events.on("shutdown", () => {
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

		this.gameSocket.once("room-joined", () => {
			this.scene.start(CST.SCENES.WAITING_ROOM, { socket: this.gameSocket });
		});

		this.add.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD).setOrigin(0).setDepth(0);

		this.createRoomButton = this.add.text(385, this.game.renderer.height * 0.2, "Create Room", {
			fontFamily: "Courier",
			fontSize: "64px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.joinRoomButton = this.add.text(385, this.game.renderer.height * 0.6, "Join Room", {
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

			createRoom(this.gameSocket);
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
			const roomId = (<HTMLInputElement>this.inputHtml.getChildByName("roomField")).value;
			this.gameSocket.emit("join-room", { roomId });
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
