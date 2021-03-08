import { GameCreatedEvent, GameEndEvent, GameOptions, HostChangeEvent, PlayerEndState } from "../../communication/race/DataInterfaces";
import { CLIENT_EVENT_NAMES } from "../../communication/race/EventNames";
import PlayerState from "../../communication/race/PlayerState";
import { RoomInfoEvent, RoomSettings } from "../../communication/room/DataInterfaces";
import { ROOM_EVENT_NAMES, WAITING_ROOM_EVENT_NAMES } from "../../communication/room/EventNames";
import { UserDTO } from "../../communication/user/UserDTO";
import ClientRaceGameController from "../../gameCore/race/ClientRaceGameController";
import Player from "../../gameCore/race/player/Player";
import PlayerFactory from "../../gameCore/race/player/PlayerFactory";
import RaceGameFactory from "../../gameCore/race/RaceGameFactory";
import { CST } from "../CST";
import { getUserHighScore } from "../services/UserInformationService";

export default class WaitingRoomScene extends Phaser.Scene {
	private startButton: Phaser.GameObjects.Text;
	private readyButton: Phaser.GameObjects.Text;
	private quitButton: Phaser.GameObjects.Text;
	private highScoreText: Phaser.GameObjects.Text;
	private currentHost: Phaser.GameObjects.Text;
	private roomIdText: Phaser.GameObjects.Text;
	private gameSocket: SocketIOClient.Socket;
	private usersListHtml: Phaser.GameObjects.DOMElement;
	private usersDTO: UserDTO[] = [];
	private gameResultsHtml: Phaser.GameObjects.DOMElement;
	private gameOptions: Phaser.GameObjects.DOMElement;
	private roomSettings: Phaser.GameObjects.DOMElement;
	private nbPlayersText: Phaser.GameObjects.Text;
	private isPrivateText: Phaser.GameObjects.Text;
	private applySettingsText: Phaser.GameObjects.Text;
	private nbPlayers: number = 0;
	private isPrivate: boolean = false;
	private lastGameResults: GameEndEvent;
	private isHost: boolean = false;
	private hostName: string = "Current host: ";
	private highScore: number;
	private roomId: string = "Room id: ";
	private kickButton: Phaser.GameObjects.Text;
	private kickPlayerInput: Phaser.GameObjects.DOMElement;

	constructor() {
		super({ key: CST.SCENES.WAITING_ROOM });
	}

	init(data: any) {
		this.lastGameResults = data.lastGameData;
		this.highScore = getUserHighScore();

		this.gameSocket = data.socket;
		this.gameSocket.once(CLIENT_EVENT_NAMES.GAME_CREATED, (gameInfo: GameCreatedEvent) => {
			const raceGame: ClientRaceGameController = RaceGameFactory.createClient(
				gameInfo.gameTime,
				gameInfo.gameStartTimeStamp,
				gameInfo.grid,
				this.createPlayers(gameInfo.players),
				this.gameSocket.id,
				this.gameSocket
			);

			this.scene.start(CST.SCENES.RACE_GAME, { gameController: raceGame, roomId: this.roomId });
		});
		this.gameSocket.once(WAITING_ROOM_EVENT_NAMES.KICKED, () => this.quitScene());
		this.gameSocket.on(ROOM_EVENT_NAMES.HOST_CHANGE, (data: HostChangeEvent) => {
			this.isHost = false;
			this.hostName = `Current host: ${data.newHostName}`;
		});
		this.gameSocket.on(ROOM_EVENT_NAMES.IS_HOST, () => {
			this.isHost = true;
			this.updateUsersList();
		});
		this.gameSocket.on(ROOM_EVENT_NAMES.CHANGE_ROOM_SETTINGS, (roomSettings: RoomSettings) => {
			this.nbPlayers = roomSettings.maxPlayerCount;
			this.isPrivate = roomSettings.isPrivate;
			(<HTMLInputElement>this.roomSettings.getChildByID("isPrivate")).checked = roomSettings.isPrivate;
			(<HTMLInputElement>this.roomSettings.getChildByID("nbPlayers")).value = String(roomSettings.maxPlayerCount);
		});

		this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			this.gameSocket.removeEventListener(ROOM_EVENT_NAMES.CHANGE_ROOM_SETTINGS);
			this.gameSocket.removeEventListener(ROOM_EVENT_NAMES.IS_HOST);
			this.gameSocket.removeEventListener(ROOM_EVENT_NAMES.HOST_CHANGE);
		});
	}

	create() {
		this.add.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD).setOrigin(0).setDepth(0);

		this.usersListHtml = this.add.dom(this.game.renderer.width * 0.3, this.game.renderer.height * 0.2).createFromCache(CST.HTML.USERS_LIST);
		this.kickPlayerInput = this.add.dom(this.game.renderer.width * 0.23, this.game.renderer.height * 0.6).createFromCache(CST.HTML.PLAYER_KICK_INPUT);
		this.gameOptions = this.add.dom(this.game.renderer.width * 0.3, this.game.renderer.height * 0.7).createFromCache(CST.HTML.GAME_OPTIONS);
		this.roomSettings = this.add.dom(this.game.renderer.width * 0.67, this.game.renderer.height * 0.4).createFromCache(CST.HTML.ROOM_SETTINGS);

		this.currentHost = this.add.text(this.game.renderer.width * 0.65, this.game.renderer.height * 0.1, this.hostName, {
			fontFamily: "Courier",
			fontSize: "30px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.applySettingsText = this.add
			.text(this.game.renderer.width * 0.65, this.game.renderer.height * 0.5, "Apply settings", {
				fontFamily: "Courier",
				fontSize: "30px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

		this.isPrivateText = this.add.text(this.game.renderer.width * 0.65, this.game.renderer.height * 0.6, "Private: ", {
			fontFamily: "Courier",
			fontSize: "30px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.nbPlayersText = this.add.text(this.game.renderer.width * 0.65, this.game.renderer.height * 0.65, "Number of players: ", {
			fontFamily: "Courier",
			fontSize: "30px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.roomIdText = this.add.text(this.game.renderer.width * 0.65, this.game.renderer.height * 0.15, this.roomId, {
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

		this.applySettingsText.on("pointerover", () => {
			this.applySettingsText.setTint(0xffff66);
		});

		this.applySettingsText.on("pointerout", () => {
			this.applySettingsText.clearTint();
		});

		this.applySettingsText.on("pointerdown", () => {
			this.applySettingsText.setTint(0x86bfda);
		});

		this.applySettingsText.on("pointerup", () => {
			this.startButton.clearTint();
			this.gameSocket.emit(ROOM_EVENT_NAMES.CHANGE_ROOM_SETTINGS, <RoomSettings>{
				isPrivate: (<HTMLInputElement>this.roomSettings.getChildByID("isPrivate")).checked,
				maxPlayerCount: Number((<HTMLInputElement>this.roomSettings.getChildByID("nbPlayers")).value),
			});
		});

		this.kickButton = this.add
			.text(this.game.renderer.width * 0.32, this.game.renderer.height * 0.58, "kick", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

		this.kickButton.on("pointerover", () => {
			this.kickButton.setTint(0xffff66);
		});

		this.kickButton.on("pointerout", () => {
			this.kickButton.clearTint();
		});

		this.kickButton.on("pointerdown", () => {
			this.kickButton.setTint(0x86bfda);
		});

		this.kickButton.on("pointerup", () => {
			this.kickButton.clearTint();
			this.gameSocket.emit(WAITING_ROOM_EVENT_NAMES.KICK_PLAYER, (<HTMLInputElement>this.kickPlayerInput.getChildByID("playerField")).value);
		});

		this.startButton = this.add
			.text(this.game.renderer.width * 0.55, this.game.renderer.height * 0.9, "Start Game", {
				fontFamily: "Courier",
				fontSize: "40px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

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
			this.gameSocket.removeEventListener(WAITING_ROOM_EVENT_NAMES.ROOM_INFO);
			this.gameSocket.emit(CLIENT_EVENT_NAMES.GAME_INITIALIZED, <GameOptions>{
				gameTime: Number((<HTMLInputElement>this.gameOptions.getChildByID("gameTime")).value),
			});
		});

		this.readyButton = this.add
			.text(this.game.renderer.width * 0.8, this.game.renderer.height * 0.9, "Ready", {
				fontFamily: "Courier",
				fontSize: "40px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

		this.readyButton.on("pointerover", () => {
			this.readyButton.setTint(0xffff66);
		});

		this.readyButton.on("pointerout", () => {
			this.readyButton.clearTint();
		});

		this.readyButton.on("pointerdown", () => {
			this.readyButton.setTint(0x86bfda);
		});

		this.readyButton.on("pointerup", () => {
			this.readyButton.clearTint();
			this.gameSocket.emit(WAITING_ROOM_EVENT_NAMES.READY);
		});

		this.quitButton = this.add
			.text(this.game.renderer.width * 0.05, this.game.renderer.height * 0.1, "<- Leave Room", {
				fontFamily: "Courier",
				fontSize: "40px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

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
			this.quitScene();
		});

		this.gameSocket.on(WAITING_ROOM_EVENT_NAMES.ROOM_INFO, (data: RoomInfoEvent) => {
			this.hostName = `Current host: ${data.hostName}`;
			this.roomId = `Room id: ${data.roomId}`;
			this.usersDTO = data.userDTOs;

			this.updateUsersList();
		});

		this.gameSocket.emit(WAITING_ROOM_EVENT_NAMES.SCENE_LOADED);
	}

	update() {
		this.startButton.setVisible(this.isHost).setActive(this.isHost);
		this.gameOptions.setVisible(this.isHost).setActive(this.isHost);
		this.roomSettings.setVisible(this.isHost).setActive(this.isHost);
		this.applySettingsText.setVisible(this.isHost).setActive(this.isHost);
		this.currentHost.text = this.hostName;
		this.roomIdText.text = this.roomId;
		this.nbPlayersText.setText(`Number of players: ${this.nbPlayers}`);
		this.isPrivateText.setText(`Private: ${this.isPrivate}`);
	}

	private quitScene() {
		this.gameSocket.removeEventListener(WAITING_ROOM_EVENT_NAMES.KICKED);
		this.gameSocket.removeEventListener(WAITING_ROOM_EVENT_NAMES.ROOM_INFO);
		this.gameSocket.close();
		this.scene.start(CST.SCENES.GAME_SELECTION);
	}

	private createPlayers(playersState: PlayerState[]): Player[] {
		let players: Player[] = [];
		playersState.forEach((playerState: PlayerState) => {
			players.push(PlayerFactory.createFromPlayerState(playerState));
		});
		return players;
	}

	private updateUsersList(): void {
		let usersList = <HTMLInputElement>this.usersListHtml.getChildByID("usersList");

		while (usersList.firstChild) {
			usersList.removeChild(usersList.firstChild);
		}

		if (this.usersDTO.length > 1) {
			this.highScoreText.setActive(false).setVisible(false);
		} else {
			this.highScoreText.setActive(true).setVisible(true);
		}

		this.usersDTO.forEach((user) => {
			var li = document.createElement("li");
			const isReady = user.isReady ? "Ready" : "Not ready";
			const displayedInfo = this.isHost ? `${user.userInfo.name} - ${user.userId} / ${isReady}` : `${user.userInfo.name} / ${isReady}`;
			li.appendChild(document.createTextNode(displayedInfo));
			usersList.appendChild(li);
		});
	}
}
