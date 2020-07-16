import { GameStartEvent } from "../../Communication/Race/dataInterfaces";
import { CLIENT_EVENT_NAMES } from "../../Communication/Race/eventNames";
import PlayerState from "../../Communication/Race/playerState";
import ClientRaceGameController from "../../GameCore/Race/clientRaceGameController";
import Player from "../../GameCore/Race/player/player";
import PlayerFactory from "../../GameCore/Race/player/playerFactory";
import RaceGameFactory from "../../GameCore/Race/raceGameFactory";
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
