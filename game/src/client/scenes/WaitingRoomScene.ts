import { GameStartEvent, UsersInfoSentEvent } from "../../communication/race/DataInterfaces";
import { CLIENT_EVENT_NAMES, WAITING_ROOM_EVENT_NAMES } from "../../communication/race/EventNames";
import PlayerState from "../../communication/race/PlayerState";
import ClientRaceGameController from "../../gameCore/race/ClientRaceGameController";
import Player from "../../gameCore/race/player/Player";
import PlayerFactory from "../../gameCore/race/player/PlayerFactory";
import RaceGameFactory from "../../gameCore/race/RaceGameFactory";
import { CST } from "../CST";

export default class WaitingRoomScene extends Phaser.Scene {
	private startButton: Phaser.GameObjects.Text;
	private quitButton: Phaser.GameObjects.Text;
	private gameSocket: SocketIOClient.Socket;
	private usersListHtml: Phaser.GameObjects.DOMElement;

	constructor() {
		const sceneConfig = { key: CST.SCENES.WAITING_ROOM };
		super(sceneConfig);
	}

	init(data: any) {
		this.gameSocket = data.socket;
		this.gameSocket.once(CLIENT_EVENT_NAMES.GAME_START, (gameInfo: GameStartEvent) => {
			const raceGame: ClientRaceGameController = RaceGameFactory.createClient(
				gameInfo.gameTime,
				gameInfo.gameStartTimeStamp,
				gameInfo.grid,
				this.createPlayers(gameInfo.players),
				this.gameSocket.id,
				this.gameSocket
			);

			this.scene.start(CST.SCENES.RACE_GAME, { gameController: raceGame });
		});
	}

	create() {
		this.add.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD).setOrigin(0).setDepth(0);

		this.usersListHtml = this.add.dom(this.game.renderer.width * 0.5, this.game.renderer.height * 0.2).createFromCache(CST.HTML.USERS_LIST);

		this.gameSocket.on(WAITING_ROOM_EVENT_NAMES.CURRENT_USERS, (data: UsersInfoSentEvent) => {
			let usersList = <HTMLInputElement>this.usersListHtml.getChildByID("usersList");

			while (usersList.firstChild) {
				usersList.removeChild(usersList.firstChild);
			}

			data.usersInfo.forEach((userInfo) => {
				var li = document.createElement("li");
				li.appendChild(document.createTextNode(userInfo.name));
				usersList.appendChild(li);
			});
		});

		this.startButton = this.add.text(this.game.renderer.width * 0.65, this.game.renderer.height * 0.85, "Start Game", {
			fontFamily: "Courier",
			fontSize: "50px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.quitButton = this.add.text(this.game.renderer.width * 0.05, this.game.renderer.height * 0.1, "<- Leave Room", {
			fontFamily: "Courier",
			fontSize: "40px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.startButton.setInteractive({ useHandCursor: true });

		this.quitButton.setInteractive({ useHandCursor: true });

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
			this.gameSocket.removeEventListener(WAITING_ROOM_EVENT_NAMES.CURRENT_USERS);
			this.gameSocket.emit(CLIENT_EVENT_NAMES.GAME_START);
		});

		this.quitButton.on("pointerover", () => {
			this.startButton.setTint(0xffff66);
		});

		this.quitButton.on("pointerout", () => {
			this.startButton.clearTint();
		});

		this.quitButton.on("pointerdown", () => {
			this.startButton.setTint(0x86bfda);
		});

		this.quitButton.on("pointerup", () => {
			this.startButton.clearTint();
			this.gameSocket.removeEventListener(WAITING_ROOM_EVENT_NAMES.CURRENT_USERS);
			this.gameSocket.close();
			this.scene.start(CST.SCENES.ROOM_SELECTION);
		});

		this.gameSocket.emit(WAITING_ROOM_EVENT_NAMES.SCENE_LOADED);
	}

	private createPlayers(playersState: PlayerState[]): Player[] {
		let players: Player[] = [];
		playersState.forEach((playerState: PlayerState) => {
			players.push(PlayerFactory.createFromPlayerState(playerState));
		});
		return players;
	}
}
