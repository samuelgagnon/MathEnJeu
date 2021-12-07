import { CST } from "../CST";
import { createRoom } from "../services/RoomService";
import BaseScene from "./BaseScene";
import { getUserInfo } from "../services/UserInformationService";
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from "../GameConfig";

export default class GameSelection extends BaseScene {
	private backButton: Phaser.GameObjects.Image;
	private gameSocket: SocketIOClient.Socket;

	// constructor() {
	// 	const sceneConfig = { key: CST.SCENES.GAME_SELECTION };
	// 	super(sceneConfig);
	// }

	init(data: any) {
		this.gameSocket = this.initializeSocket();
	}

	create() {
		this.scale.setGameSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
		document.body.style.backgroundImage = 'url("static/client/assets/images/starfield.png")'; 
		// this.add.image(Number(this.game.config.width) / 2 + 6, Number(this.game.config.height) / 2 + 18, CST.IMAGES.BACKGROUD).setScale(0.71, 0.713);

		var image = this.add.image(window.innerWidth / 2, window.innerHeight / 2, CST.IMAGES.OPTIONS_BACK).setScale(0.85);
		this.backButton = this.add
			.image(image.x - 570, image.y - 150, CST.IMAGES.BACK)
			.setScale(0.55)
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
		this.add
			.text(image.x - 10 - (getUserInfo().name.length - 1) * 12.5, image.y - 280, getUserInfo().name, {
				fontFamily: "Arial",
				fontSize: "55px",
				color: "#FFF",
			})
			.setScale(0.85)
			.setDepth(1);
		this.add
			.text(image.x - 190, image.y - 215, "Choisis ton mode pour partir a l'aventure!", {
				fontFamily: "Arial",
				fontSize: "25px",
				color: "#FFF",
			})
			.setScale(0.85)
			.setDepth(1);
		this.add
			.text(image.x - 310, image.y + 30, "Mode solo", {
				fontFamily: "Arial",
				fontSize: "40px",
				align: "center",
				color: "#FFF",
			})
			.setScale(0.85)
			.setDepth(1);
		this.add
			.text(image.x - -140, image.y + 30, "Mode multijoueur", {
				fontFamily: "Arial",
				fontSize: "40px",
				align: "center",
				color: "#FFF",
			})
			.setScale(0.85)
			.setDepth(1);
		let playButton = this.add
			.text(image.x - 278, image.y + 115, "JOUER", {
				fontFamily: "Arial",
				fontSize: "25px",
				align: "center",
				color: "#FFF",
			})
			.setInteractive({ useHandCursor: true });
		let playButton1 = this.add
			.text(image.x + 227, image.y + 115, "JOUER", {
				fontFamily: "Arial",
				fontSize: "25px",
				align: "center",
				color: "#FFF",
			})
			.setInteractive({ useHandCursor: true });
		playButton
			.on("pointerover", () => {
				playButton.setTint(0xffff66);
			})
			.on("pointerout", () => {
				playButton.clearTint();
			})
			.on("pointerdown", () => {
				playButton.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				playButton.clearTint();
				const numberOfPlayers = Number(1);
				const isPrivate = true;
				createRoom(this.gameSocket, { isPrivate, maxPlayerCount: numberOfPlayers, createTime: 10, type: "createRoom" });
			});
		playButton1
			.on("pointerover", () => {
				playButton1.setTint(0xffff66);
			})
			.on("pointerout", () => {
				playButton1.clearTint();
			})
			.on("pointerdown", () => {
				playButton1.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				playButton1.clearTint();
				this.scene.start(CST.SCENES.ROOM_CREATION);
			});
	}

	update() {}
}
