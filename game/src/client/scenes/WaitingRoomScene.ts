import { GameStartEvent } from "../../communication/race/dataInterfaces";
import { CLIENT_EVENT_NAMES } from "../../communication/race/EventNames";
import PlayerState from "../../communication/race/PlayerState";
import ClientRaceGameController from "../../gameCore/race/ClientRaceGameController";
import Player from "../../gameCore/race/player/Player";
import PlayerFactory from "../../gameCore/race/player/PlayerFactory";
import RaceGameFactory from "../../gameCore/race/RaceGameFactory";
import { CST } from "../CST";

export default class WaitingRoomScene extends Phaser.Scene {
	private startButton: Phaser.GameObjects.Text;
	private gameSocket: SocketIOClient.Socket;

	constructor() {
		const sceneConfig = { key: CST.SCENES.WAITING_ROOM };
		super(sceneConfig);
	}

	init(data: any) {
		this.gameSocket = data.socket;
		this.gameSocket.once(CLIENT_EVENT_NAMES.GAME_START, (gameInfo: GameStartEvent) => {
			console.log(gameInfo);

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

		this.startButton = this.add.text(this.game.renderer.width * 0.65, this.game.renderer.height * 0.85, "Start Game", {
			fontFamily: "Courier",
			fontSize: "50px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.startButton.setInteractive({ useHandCursor: true });

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
			this.gameSocket.emit(CLIENT_EVENT_NAMES.GAME_START);
		});
	}

	private createPlayers(playersState: PlayerState[]): Player[] {
		let players: Player[] = [];
		playersState.forEach((playerState: PlayerState) => {
			players.push(PlayerFactory.createFromPlayerState(playerState));
		});
		return players;
	}
}
