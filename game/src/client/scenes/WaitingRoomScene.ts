import {
	GameEndEvent,
	GameOptions,
	GameStartEvent,
	HostChangeEvent,
	PlayerEndState,
	UsersInfoSentEvent,
} from "../../communication/race/DataInterfaces";
import { CLIENT_EVENT_NAMES, WAITING_ROOM_EVENT_NAMES } from "../../communication/race/EventNames";
import PlayerState from "../../communication/race/PlayerState";
import { ROOM_EVENT_NAMES } from "../../communication/room/EventNames";
import ClientRaceGameController from "../../gameCore/race/ClientRaceGameController";
import Player from "../../gameCore/race/player/Player";
import PlayerFactory from "../../gameCore/race/player/PlayerFactory";
import RaceGameFactory from "../../gameCore/race/RaceGameFactory";
import { CST } from "../CST";
import { getUserHighScore } from "../services/UserInformationService";

export default class WaitingRoomScene extends Phaser.Scene {
	private startButton: Phaser.GameObjects.Text;
	private quitButton: Phaser.GameObjects.Text;
	private highScoreText: Phaser.GameObjects.Text;
	private currentHost: Phaser.GameObjects.Text;
	private gameSocket: SocketIOClient.Socket;
	private usersListHtml: Phaser.GameObjects.DOMElement;
	private gameResultsHtml: Phaser.GameObjects.DOMElement;
	private gameOptions: Phaser.GameObjects.DOMElement;
	private lastGameResults: GameEndEvent;
	private isHost: boolean;
	private hostName: string;
	private highScore: number;

	constructor() {
		const sceneConfig = { key: CST.SCENES.WAITING_ROOM };
		super(sceneConfig);
	}

	init(data: any) {
		this.lastGameResults = data.lastGameData;
		this.hostName = "Current host: ";
		this.isHost = false;
		this.highScore = getUserHighScore();

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
		this.gameSocket.on(ROOM_EVENT_NAMES.HOST_CHANGE, (data: HostChangeEvent) => {
			this.isHost = false;
			this.hostName = `Current host: ${data.newHostName}`;
		});
		this.gameSocket.on(ROOM_EVENT_NAMES.IS_HOST, () => {
			this.isHost = true;
		});
	}

	create() {
		this.add.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD).setOrigin(0).setDepth(0);

		this.usersListHtml = this.add.dom(this.game.renderer.width * 0.3, this.game.renderer.height * 0.2).createFromCache(CST.HTML.USERS_LIST);
		this.gameOptions = this.add.dom(this.game.renderer.width * 0.3, this.game.renderer.height * 0.7).createFromCache(CST.HTML.GAME_OPTIONS);

		this.currentHost = this.add.text(this.game.renderer.width * 0.65, this.game.renderer.height * 0.1, "Current host: ", {
			fontFamily: "Courier",
			fontSize: "30px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		if (this.lastGameResults != undefined) {
			this.gameResultsHtml = this.add.dom(this.game.renderer.width * 0.6, this.game.renderer.height * 0.2).createFromCache(CST.HTML.GAME_RESULTS);

			let playerList = <HTMLInputElement>this.gameResultsHtml.getChildByID("playerList");

			this.lastGameResults.playerEndStates.forEach((playerInfo: PlayerEndState) => {
				var li = document.createElement("li");
				li.appendChild(document.createTextNode(`Player: ${playerInfo.name} - ${playerInfo.points} pts`));
				playerList.appendChild(li);
			});
		}

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

		this.highScoreText = this.add
			.text(this.game.renderer.width * 0.35, this.game.renderer.height * 0.1, `HighScore: ${this.highScore}`, {
				fontFamily: "Courier",
				fontSize: "40px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setVisible(false)
			.setActive(false);

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
			this.gameSocket.emit(CLIENT_EVENT_NAMES.GAME_INITIALIZED, <GameOptions>{
				gameTime: Number((<HTMLInputElement>this.gameOptions.getChildByID("gameTime")).value),
			});
		});

		this.quitButton.on("pointerover", () => {
			this.quitButton.setTint(0xffff66);
		});

		this.quitButton.on("pointerout", () => {
			this.quitButton.clearTint();
		});

		this.quitButton.on("pointerdown", () => {
			this.quitButton.setTint(0x86bfda);
		});

		this.quitButton.on("pointerup", () => {
			this.quitButton.clearTint();
			this.gameSocket.removeEventListener(WAITING_ROOM_EVENT_NAMES.CURRENT_USERS);
			this.gameSocket.close();
			this.scene.start(CST.SCENES.GAME_SELECTION);
		});

		this.gameSocket.on(WAITING_ROOM_EVENT_NAMES.CURRENT_USERS, (data: UsersInfoSentEvent) => {
			this.hostName = `Current host: ${data.hostName}`;

			let usersList = <HTMLInputElement>this.usersListHtml.getChildByID("usersList");

			while (usersList.firstChild) {
				usersList.removeChild(usersList.firstChild);
			}

			if (data.usersInfo.length > 1) {
				this.highScoreText.setActive(false).setVisible(false);
			} else {
				this.highScoreText.setActive(true).setVisible(true);
			}

			data.usersInfo.forEach((userInfo) => {
				var li = document.createElement("li");
				li.appendChild(document.createTextNode(userInfo.name));
				usersList.appendChild(li);
			});
		});

		this.gameSocket.emit(WAITING_ROOM_EVENT_NAMES.SCENE_LOADED);
	}

	update() {
		this.startButton.setVisible(this.isHost).setActive(this.isHost);
		this.gameOptions.setVisible(this.isHost).setActive(this.isHost);
		this.currentHost.text = this.hostName;
	}

	private createPlayers(playersState: PlayerState[]): Player[] {
		let players: Player[] = [];
		playersState.forEach((playerState: PlayerState) => {
			players.push(PlayerFactory.createFromPlayerState(playerState));
		});
		return players;
	}
}
