import ContainerLite from "phaser3-rex-plugins/plugins/containerlite";
import ScrollablePanel from "phaser3-rex-plugins/templates/ui/scrollablepanel/ScrollablePanel";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin";
import { GameCreatedEvent, GameEndEvent } from "../../communication/race/EventInterfaces";
import { CLIENT_EVENT_NAMES } from "../../communication/race/EventNames";
import { GameInitializedEvent, HostChangeEvent, GameOptions, RoomInfoEvent, RoomSettings } from "../../communication/room/EventInterfaces";
import BaseScene from "./BaseScene";
import { ROOM_EVENT_NAMES, WAITING_ROOM_EVENT_NAMES } from "../../communication/room/EventNames";
import { UserDTO } from "../../communication/user/UserDTO";
import { Clock } from "../../gameCore/clock/Clock";
import ClientRaceGameController from "../../gameCore/race/ClientRaceGameController";
import RaceGameFactory from "../../gameCore/race/RaceGameFactory";
import { getTranslate, userLanguage } from "../assets/locales/translate";
import { CST } from "../CST";
import { getUserHighScore, getUserInfo } from "../services/UserInformationService";
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from "../GameConfig";

const backImageWidth = 72;
export default class WaitingRoomScene extends BaseScene {
	private gameSocket: SocketIOClient.Socket;
	private usersDTO: UserDTO[] = [];
	private botPlayers = [];
	private playerBox: PlayerList[] = [];
	private nbPlayers: number = 0;
	private isPrivate: boolean = false;
	private createTime: number = 0;
	private lastGameResults: GameEndEvent;
	private isHost: boolean = false;
	private hostName: string = `${getTranslate("waitingRoom.host")}: `;
	private highScore: number;
	private roomId: string = getTranslate("waitingRoom.roomId");
	private boxImage: Phaser.GameObjects.Image;
	private countDownBack: Phaser.GameObjects.Image;
	private startGameIn: Phaser.GameObjects.Text;
	private countDown: Phaser.GameObjects.Text;
	private cancelLaunch: Phaser.GameObjects.Text;
	private cancelGame: Phaser.GameObjects.Rectangle;
	private countDownX: any;
	private confirmDialog: Phaser.GameObjects.Image;
	private closeButton: Phaser.GameObjects.Image;
	private closeButton1: Phaser.GameObjects.Image;
	private title: Phaser.GameObjects.Text;
	private subTitle: Phaser.GameObjects.Text;
	private quitterBtn: Phaser.GameObjects.Text;
	private resterBtn: Phaser.GameObjects.Text;
	private isShow: boolean = false;
	private screenType: string;
	private createRoomBack: Phaser.GameObjects.Image;
	private privateImage: Phaser.GameObjects.Image;
	private publicImage: Phaser.GameObjects.Image;
	private lock: Phaser.GameObjects.Image;
	private unlock: Phaser.GameObjects.Image;
	private publicText: Phaser.GameObjects.Text;
	private privateText: Phaser.GameObjects.Text;
	private timeProgress: Phaser.GameObjects.Image;
	private timeProgress1: Phaser.GameObjects.Image;
	private timeCircle1: Phaser.GameObjects.Image;
	private timeCircleStore: any = [];
	private timeBack: Phaser.GameObjects.Image;
	private times: Phaser.GameObjects.Text;
	private nombredejoueurs: Phaser.GameObjects.Text;
	private numberBack: Phaser.GameObjects.Image;
	private minus: Phaser.GameObjects.Text;
	private numberOfPlayer: number = 1;
	private players: Phaser.GameObjects.Text;
	private plus: Phaser.GameObjects.Text;
	private createButton: Phaser.GameObjects.Text;
	private settings: Phaser.GameObjects.Text;
	private createRect: Phaser.GameObjects.Rectangle;
	private iscreateRoom: boolean = true;
	private timeOfTimebar: number = 10;
	private gameDuration: Phaser.GameObjects.Text;
	private roomTitle: Phaser.GameObjects.Text;
	private startGame: Phaser.GameObjects.Rectangle;
	private roomSettings: Phaser.GameObjects.Text;
	private energybar: Phaser.GameObjects.Image;
	private progress: Phaser.GameObjects.Graphics;
	private launch: Phaser.GameObjects.Text;
	private New_timeCircle1: Phaser.GameObjects.Image;
	private New_timeBack: Phaser.GameObjects.Image;
	private New_times: Phaser.GameObjects.Text;
	private RoomId: Phaser.GameObjects.DOMElement;
	private warningCharacter: Phaser.GameObjects.Text;
	private roomSettingsRect: Phaser.GameObjects.Rectangle;
	private quitterrect: Phaser.GameObjects.Rectangle;
	private readyStartGame: Phaser.GameObjects.Rectangle;
	private resterRect: Phaser.GameObjects.Rectangle;
	private container: Phaser.GameObjects.Container;
	private createRoom: boolean = false;
	private scrollablePanel: ScrollablePanel;
	private rexUI: RexUIPlugin;
	private character: Phaser.GameObjects.Image;
	private selectedHelmet: Phaser.GameObjects.Sprite;
	private bottomSprite: Phaser.GameObjects.Sprite;
	private wobbleAnimDelay: number = 0;
	private launchX: any;
	private isCharacterImage: boolean = false;
	private startCountdownText: Phaser.GameObjects.Text;
	private readyGame: Phaser.GameObjects.Text;
	private isGameInitializing: boolean = false;
	private preGameToInGameTimestamp: number = 0;
	private helmetData = [1, 5, 9, 13, 17, 21, 25, 31, 37, 41, 45, 49, 54, 58, 62, 66, 70, 75, 79, 84, 88, 92, 96, 101, 105, 109, 113, 117];
	private selectedHelmetIndex = 0;
	private new_Left: Phaser.GameObjects.Image;
	private new_right: Phaser.GameObjects.Image;
	private isHostAdd: boolean = true;
	private roomName: Phaser.GameObjects.Text;
	private userName: Phaser.GameObjects.Text;
	private goBack: Phaser.GameObjects.Image;
	private readyCheck: Phaser.GameObjects.Image;
	private isReadyPlayer: boolean = false;
	private minusSign: Phaser.GameObjects.Image;
	private plusSign: Phaser.GameObjects.Image;
	raceGame1: ClientRaceGameController;
	constructor() {
		super({ key: CST.SCENES.WAITING_ROOM });
	}

	init(data: any) {
		this.isGameInitializing = false;
		this.playerBox = [];
		this.timeCircleStore = [];
		this.isCharacterImage = false;
		this.lastGameResults = data.lastGameData;
		this.highScore = getUserHighScore();
		this.screenType = data.type;
		this.gameSocket = data.socket;

		if (data.createTime) {
			this.timeOfTimebar = data.createTime;
		}

		this.gameSocket.once(CLIENT_EVENT_NAMES.GAME_CREATED, (gameInfo: GameCreatedEvent) => {
			const raceGame: ClientRaceGameController = RaceGameFactory.createClient(
				gameInfo.gameTime,
				gameInfo.gameStartTimeStamp,
				gameInfo.grid,
				RaceGameFactory.createClientPlayers(gameInfo.players),
				this.gameSocket.id,
				this.gameSocket
			);

			this.scene.start(CST.SCENES.RACE_GAME, { gameController: raceGame, roomId: this.roomId });
		});
		this.gameSocket.once(WAITING_ROOM_EVENT_NAMES.CLIENT_EVENT.KICKED, () => this.quitScene());
		this.gameSocket.on(ROOM_EVENT_NAMES.HOST_CHANGE, (data: HostChangeEvent) => {
			this.isHost = false;
			this.hostName = `${getTranslate("waitingRoom.host")}: ${data.newHostName}`;
			this.roomName.setText(`${getTranslate("waitingRoom.partOf")} ${data.newHostName}`);
		});
		this.gameSocket.on(ROOM_EVENT_NAMES.IS_HOST, () => {
			this.isHost = true;
			if (this.screenType !== "createroom") {
				// this.updateUsersList();
				this.screenType = "host";
				this.updatePanel(this.scrollablePanel);
				this.add.image(this.boxImage.x + 370, this.boxImage.y - 190, CST.IMAGES.NEW_BUTTON).setScale(0.8);
				this.roomSettings = this.add
					.text(this.boxImage.x, this.boxImage.y - 200, getTranslate("waitingRoom.gameSettings"), {
						fontFamily: "ArcherBook",
						fontSize: "18px",
						align: "center",
						color: "#FFF",
					})
					.setInteractive({ useHandCursor: true });
				this.roomSettings.setX(this.roomSettings.x - this.roomSettings.width / 2 + backImageWidth * 5.1);

				this.roomSettingsRect = this.add.rectangle(this.boxImage.x + 370, this.boxImage.y - 190, 220, 40).setInteractive({ useHandCursor: true });

				this.roomSettingsRect
					.on("pointerover", () => {
						this.roomSettings.setTint(0xffff66);
					})
					.on("pointerout", () => {
						this.roomSettings.clearTint();
					})
					.on("pointerdown", () => {
						this.roomSettings.setTint(0x86bfda);
					})
					.on("pointerup", () => {
						this.roomSettings.clearTint();
						this.openCreateRoom();
					});

				this.energybar = this.add
					.image(this.boxImage.x + 180, this.boxImage.y + 280, CST.IMAGES.BOTTOM_BAR)
					.setScale(0.8)
					.setDepth(1);

				this.launch = this.add
					.text(this.boxImage.x, this.boxImage.y + 270, getTranslate("waitingRoom.startGame"), {
						fontFamily: "ArcherBoldPro",
						fontSize: "20px",
						align: "center",
						color: "#FFF",
					})
					.setDepth(2)
					.setAlpha(1);
				this.launchX = this.launch.x;

				this.launch.setX(this.launchX - this.launch.width / 2 + backImageWidth * 5.27);
				this.startGame = this.add
					.rectangle(this.boxImage.x + 380, this.boxImage.y + 284, 200, 40)
					.setDepth(2)
					.setInteractive({ useHandCursor: true });

				this.startGame
					.on("pointerover", () => {
						this.launch.setTint(0xffff66);
					})
					.on("pointerout", () => {
						this.launch.clearTint();
					})
					.on("pointerdown", () => {
						this.launch.setTint(0x86bfda);
					})
					.on("pointerup", () => {
						this.launch.clearTint();
						if (!this.isGameInitializing) {
							var newUsersDTO = this.usersDTO.filter((item) => item.isReady);

							setTimeout(() => {
								if (this.usersDTO.length > 1) {
									this.gameSocket.removeEventListener(WAITING_ROOM_EVENT_NAMES.CLIENT_EVENT.ROOM_INFO);
									this.gameSocket.emit(CLIENT_EVENT_NAMES.GAME_INITIALIZED, <GameOptions>{
										gameTime: this.createTime,
										// gameTime: 0.1,
										computerPlayerCount: this.botPlayers.length,
									});
								}
								if (this.usersDTO.length === 1) {
									this.gameSocket.emit(ROOM_EVENT_NAMES.CHANGE_ROOM_SETTINGS, <RoomSettings>{
										isPrivate: true,
										maxPlayerCount: 1,
										createTime: this.timeOfTimebar,
										type: "createroom",
									});
									this.scene.start(CST.SCENES.WAITING_ROOM, {
										socket: this.gameSocket,
										type: "createroom",
										createTime: this.timeOfTimebar,
									});
								}
							}, 1000);
						}
					});

				var slideWidth = this.timeProgress.width + this.timeProgress.x - 230;
				var timeBackX = this.timeBack.x;
				var oneMinute = (slideWidth - timeBackX) / 20;
				this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
					if (dragX >= this.timeProgress.x - 165 && dragX <= slideWidth) {
						var timeValue = (dragX - timeBackX) / oneMinute + 10;
						gameObject.x = dragX;
						this.times.x = dragX - 21;
						var time = Math.round(timeValue);
						this.timeOfTimebar = time;
						this.times.setText(`${time} min`);
					}
				});
				if (!this.RoomId?.getChildByID("roomId")) {
					this.RoomId = this.add
						.dom(this.boxImage.x, this.boxImage.y - 190)
						.createFromCache(CST.HTML.HOST_ID)
						.setVisible(true);
				}
				if (!this.warningCharacter) {
					this.warningCharacter = this.add.text(this.boxImage.x - 125, this.boxImage.y - 170, getTranslate("waitingRoom.selectCharacter"), {
						fontFamily: "ArcherBoldPro",
						fontSize: "18px",
						align: "center",
						color: "#FFF",
					});
				}
				this.roomTitle?.destroy();
			}
		});
		this.gameSocket.on(ROOM_EVENT_NAMES.CHANGE_ROOM_SETTINGS, (roomSettings: RoomSettings) => {
			this.nbPlayers = roomSettings.maxPlayerCount;
			this.isPrivate = roomSettings.isPrivate;
			this.createTime = roomSettings.createTime;
			this.numberOfPlayer = roomSettings.maxPlayerCount;
			this.players.setText(Number(this.nbPlayers).toString());
		});

		this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			this.gameSocket.removeEventListener(ROOM_EVENT_NAMES.CHANGE_ROOM_SETTINGS);
			this.gameSocket.removeEventListener(ROOM_EVENT_NAMES.IS_HOST);
			this.gameSocket.removeEventListener(ROOM_EVENT_NAMES.HOST_CHANGE);
		});
		this.gameSocket.on(WAITING_ROOM_EVENT_NAMES.CLIENT_EVENT.GAME_INITIALIZED, (data: GameInitializedEvent) => {
			this.preGameToInGameTimestamp = data.preGameToInGameTimestamp;
			this.isGameInitializing = true;
		});
		this.gameSocket.on(WAITING_ROOM_EVENT_NAMES.CLIENT_EVENT.GAME_INITIALIZATION_CANCELED, () => {
			this.isGameInitializing = false;
		});
	}

	create() {
		this.botPlayers = [];
		this.scale.setGameSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
		this.isHostAdd = true;
		this.isReadyPlayer = false;
		document.body.style.backgroundImage = 'url("static/client/assets/images/New_Background.png")';
		this.sound.add(CST.SOUND.TransitionInterfaces_04).play();
		var BoutonPret_03_ = this.sound.add(CST.SOUND.BoutonPret_03_);
		// this.add.image(Number(this.game.config.width) / 2, Number(this.game.config.height) / 2, CST.IMAGES.NEW_BACKGROUND).setScale(0.71, 0.713);

		this.boxImage = this.add
			.image(
				Number(this.game.config.width) / (this.screenType == "createroom" ? 2.1 : 2),
				Number(this.game.config.height) / 1.89,
				this.screenType == "createroom" ? CST.IMAGES.SOLO_BACK : CST.IMAGES.HOST_BACK
			)
			.setScale(0.8);

		this.readyGame = this.add.text(
			this.boxImage.x,
			this.boxImage.y + 172,
			getTranslate("userSettings.choose"),
			// getTranslate(this.screenType == "createroom" || this.screenType == "host" ? "userSettings.play" : "userSettings.choose"),
			{
				fontFamily: "ArcherBoldPro",
				fontSize: "27px",
				align: "center",
				color: "#FFF",
			}
		);
		var readyGameX = this.readyGame.x;
		this.readyGame.setX(readyGameX - this.readyGame.width / 2 - (this.screenType == "createroom" ? backImageWidth * 3.95 : backImageWidth * 4.35));

		this.readyStartGame = this.add
			.rectangle(this.boxImage.x - (this.screenType == "createroom" ? 290 : 320), this.boxImage.y + 190, 180, 35)
			.setInteractive({ useHandCursor: true });

		this.readyStartGame
			.on("pointerover", () => {
				this.readyGame.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.readyGame.clearTint();
			})
			.on("pointerdown", () => {
				this.readyGame.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.isReadyPlayer = !this.isReadyPlayer;

				if (this.isReadyPlayer) {
					this.readyCheck.setVisible(true);
					this.readyGame.setText(getTranslate("userSettings.changer"));
					// if (this.screenType !== "createroom" && this.screenType !== "host") {
					this.readyGame.setX(
						readyGameX - this.readyGame.width / 2 - (this.screenType == "createroom" ? backImageWidth * 3.84 : backImageWidth * 4.24)
					);
					this.readyGame.setY(this.boxImage.y + 175);
					this.readyGame.setScale(0.8);
					// }
					this.new_Left.alpha = 0.5;
					this.new_right.alpha = 0.5;
				} else {
					this.readyCheck.setVisible(false);
					this.readyGame.setText(getTranslate("userSettings.choose"));
					// if (this.screenType !== "createroom" && this.screenType !== "host") {
					this.readyGame.setX(
						readyGameX - this.readyGame.width / 2 - (this.screenType == "createroom" ? backImageWidth * 3.95 : backImageWidth * 4.35)
					);
					this.readyGame.setY(this.boxImage.y + 172);
					// this.readyGame.setFontSize(27);
					this.readyGame.setScale(1);
					// }
					this.new_Left.alpha = 1;
					this.new_right.alpha = 1;
				}
				this.readyGame.clearTint();
				BoutonPret_03_.play();
				this.gameSocket.emit(WAITING_ROOM_EVENT_NAMES.SERVER_EVENT.READY, { helmetIndex: this.selectedHelmetIndex });
				if (this.isGameInitializing) {
					this.gameSocket.emit(WAITING_ROOM_EVENT_NAMES.SERVER_EVENT.CANCEL_GAME_INITIALIZATION);
					return;
				}
				if (this.screenType == "createroom") {
					if (this.usersDTO.length.toString() == this.nbPlayers.toString()) {
						this.gameSocket.emit(CLIENT_EVENT_NAMES.GAME_INITIALIZED, <GameOptions>{
							gameTime: this.createTime,
							// gameTime: 0.1,
							computerPlayerCount: this.botPlayers.length,
						});
						setTimeout(() => {
							this.botPlayers.forEach((item) => {
								item.image.destroy();
								this.botPlayers = [];
							});
							this.gameSocket.removeEventListener(WAITING_ROOM_EVENT_NAMES.CLIENT_EVENT.ROOM_INFO);
						}, 10000);
					}
				}
			});

		this.readyCheck = this.add.image(this.boxImage.x - (this.screenType == "createroom" ? 290 : 320), 520, CST.IMAGES.READY).setVisible(false);
		this.roomName = this.add.text(
			this.boxImage.x,
			this.boxImage.y - (this.screenType == "createroom" ? 346 : 347),
			getTranslate("waitingRoom.partOf"),
			{
				fontFamily: "ArcherBoldPro",
				fontSize: "30px",
				align: "center",
				color: "#FFF",
			}
		);

		if (this.screenType == "host") {
			this.add.image(this.boxImage.x + 370, this.boxImage.y - 190, CST.IMAGES.NEW_BUTTON).setScale(0.8);
			this.roomSettings = this.add
				.text(this.boxImage.x, this.boxImage.y - 200, getTranslate("waitingRoom.gameSettings"), {
					fontFamily: "ArcherBook",
					fontSize: "18px",
					align: "center",
					color: "#FFF",
				})
				.setInteractive({ useHandCursor: true });
			this.roomSettings.setX(this.roomSettings.x - this.roomSettings.width / 2 + backImageWidth * 5.1);

			this.roomSettingsRect = this.add.rectangle(this.boxImage.x + 370, this.boxImage.y - 190, 220, 40).setInteractive({ useHandCursor: true });

			this.roomSettingsRect
				.on("pointerover", () => {
					this.roomSettings.setTint(0xffff66);
				})
				.on("pointerout", () => {
					this.roomSettings.clearTint();
				})
				.on("pointerdown", () => {
					this.roomSettings.setTint(0x86bfda);
				})
				.on("pointerup", () => {
					this.roomSettings.clearTint();
					this.openCreateRoom();
				});

			this.energybar = this.add
				.image(this.boxImage.x + 180, this.boxImage.y + 280, CST.IMAGES.BOTTOM_BAR)
				.setScale(0.8)
				.setDepth(1);

			this.launch = this.add
				.text(this.boxImage.x, this.boxImage.y + 270, getTranslate("waitingRoom.startGame"), {
					fontFamily: "ArcherBoldPro",
					fontSize: "20px",
					align: "center",
					color: "#FFF",
				})
				.setDepth(2)
				.setAlpha(0.5);
			this.launchX = this.launch.x;

			this.launch.setX(this.launchX - this.launch.width / 2 + backImageWidth * 5.27);
			this.startGame = this.add
				.rectangle(this.boxImage.x + 380, this.boxImage.y + 284, 200, 40)
				.setDepth(2)
				.setInteractive({ useHandCursor: true });

			this.startGame
				.on("pointerover", () => {
					this.launch.setTint(0xffff66);
				})
				.on("pointerout", () => {
					this.launch.clearTint();
				})
				.on("pointerdown", () => {
					this.launch.setTint(0x86bfda);
				})
				.on("pointerup", () => {
					this.launch.clearTint();
					var newUsersDTO = this.usersDTO.filter((item) => item.isReady);
					// if (newUsersDTO.length.toString() == this.nbPlayers.toString()) {
					if (this.usersDTO.length > 1) {
						// this.startGame.disableInteractive();
						// this.launch.setAlpha(0.5);
					}
					if (this.usersDTO.length === 1) {
						this.gameSocket.emit(ROOM_EVENT_NAMES.CHANGE_ROOM_SETTINGS, <RoomSettings>{
							isPrivate: true,
							maxPlayerCount: 1,
							createTime: this.timeOfTimebar,
							type: "createroom",
						});
						this.scene.start(CST.SCENES.WAITING_ROOM, {
							socket: this.gameSocket,
							type: "createroom",
							createTime: this.timeOfTimebar,
						});
					}
					setTimeout(() => {
						if (this.usersDTO.length > 1) {
							this.gameSocket.removeEventListener(WAITING_ROOM_EVENT_NAMES.CLIENT_EVENT.ROOM_INFO);
							this.gameSocket.emit(CLIENT_EVENT_NAMES.GAME_INITIALIZED, <GameOptions>{
								gameTime: this.createTime,
								// gameTime: 0.1,
								computerPlayerCount: this.botPlayers.length,
							});
						}
					}, 1000);
					// }
				});
		} else if (this.screenType == "createroom") {
			this.add
				.text(this.boxImage.x + 440, this.boxImage.y - 115, getTranslate("waitingRoom.playMulti"), {
					fontSize: "22px",
					align: "center",
					fontFamily: "ArcherBoldPro",
					color: "#1A0E04",
				})
				.setAlpha(0.5);

			this.add.text(this.boxImage.x - 120, this.boxImage.y - 205, getTranslate("waitingRoom.chooseDuration"), {
				fontFamily: "ArcherBook",
				fontSize: "18px",
				align: "center",
				color: "#FFF",
			});

			this.add.text(this.boxImage.x - 120, this.boxImage.y - 120, getTranslate("waitingRoom.addOpponents"), {
				fontFamily: "ArcherBook",
				fontSize: "18px",
				align: "center",
				color: "#FFF",
			});

			this.minusSign = this.add.image(this.boxImage.x + 235, this.boxImage.y - 110, CST.IMAGES.MINUS_SIGN).setInteractive({ useHandCursor: true });
			this.minusSign
				.on("pointerover", () => {
					this.minusSign.setTint(0xffff66);
				})
				.on("pointerout", () => {
					this.minusSign.clearTint();
				})
				.on("pointerdown", () => {
					this.minusSign.setTint(0x86bfda);
				})
				.on("pointerup", () => {
					this.minusSign.clearTint();
					if (this.botPlayers.length > 0) {
						this.botPlayers[this.botPlayers.length - 1].image.destroy();
						this.botPlayers = this.botPlayers.filter((i) => i.count !== this.botPlayers.length - 1);
					}
				});

			this.plusSign = this.add.image(this.boxImage.x + 270, this.boxImage.y - 110, CST.IMAGES.PLUS_SIGN).setInteractive({ useHandCursor: true });
			this.plusSign
				.on("pointerover", () => {
					this.plusSign.setTint(0xffff66);
				})
				.on("pointerout", () => {
					this.plusSign.clearTint();
				})
				.on("pointerdown", () => {
					this.plusSign.setTint(0x86bfda);
				})
				.on("pointerup", () => {
					this.plusSign.clearTint();

					if (this.botPlayers.length < 8) {
						var maskImage = this.add
							.image(
								this.boxImage.x + xImage + Math.floor(this.botPlayers.length % 4) * 100,
								this.boxImage.y + yImage + 20 + Math.floor(this.botPlayers.length / 4) * 150,
								CST.IMAGES.MaskMan2
							)
							.setScale(0.6);
						this.botPlayers.push({ image: maskImage, count: this.botPlayers.length });
					}
				});

			var multiMode = this.add
				.rectangle(this.boxImage.x + 510, this.boxImage.y + 10, 160, 150)
				.setInteractive({ useHandCursor: true })
				.setScale(1.45, 3.1);
			multiMode.on("pointerup", () => {
				this.scene.start(CST.SCENES.ROOM_CREATION);
			});

			//TIME BAR START
			this.timeProgress1 = this.add.image(this.boxImage.x + 40, this.boxImage.y - 160, CST.IMAGES.NEW_TIMEBAR).setScale(0.85);

			for (let index = 0; index < 5; index++) {
				this.New_timeCircle1 = this.add
					.image(this.timeProgress1.x - 160 + index * 81, this.timeProgress1.y, CST.IMAGES.WHITE_DOT)
					.setScale(0.85)
					.setInteractive({ useHandCursor: true });
				this.New_timeCircle1.on("pointerup", () => {
					var timeNew = (index + 1) * 5 + 5;
					this.New_timeBack.x = oneMinute1 * timeNew + New_timeBackX - 118;
					this.New_times.x = oneMinute1 * timeNew - 21 + New_timeBackX - 118;
					this.New_times.setText(`${timeNew} min`);
					this.createTime = timeNew;
				});
			}
			//1
			this.New_timeBack = this.add
				.image(this.timeProgress1.x - 112, this.timeProgress1.y, CST.IMAGES.TIME_BACKGROUND)
				.setScale(0.85)
				.setInteractive({ useHandCursor: true })
				.setVisible(true);

			this.New_times = this.add
				.text(this.New_timeBack.x - 20, this.New_timeBack.y - 9, "10 min", {
					fontFamily: "ArcherBook",
					fontSize: "15px",
					align: "center",
					color: "#ffffff",
				})
				.setVisible(true);
			this.input.setDraggable(this.New_timeBack);
			var slideWidth1 = this.timeProgress1.x + this.timeProgress1.width - 335;
			var New_timeBackX = this.New_timeBack.x;
			var oneMinute1 = (slideWidth1 - New_timeBackX) / 20;

			this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
				if (dragX >= this.timeProgress1.x - 114 && dragX <= slideWidth1) {
					var timeValue = (dragX - New_timeBackX) / oneMinute1 + 10;
					gameObject.x = dragX;
					this.New_times.x = dragX - 20;
					var time = Math.round(timeValue);
					this.createTime = time;
					this.New_times.setText(`${time} min`);
				}
			});

			if (this.timeOfTimebar) {
				this.New_times.setText(`${this.timeOfTimebar} min`);
				this.New_timeBack.x = New_timeBackX + oneMinute1 * (this.timeOfTimebar - 10);
				this.New_times.x = New_timeBackX + oneMinute1 * (this.timeOfTimebar - 10) - 20;
			}

			var xBox = -60,
				yBox = -45,
				xText = -85,
				yText = 5,
				xImage = -60,
				yImage = -45;

			[1, 2, 3, 4, 5, 6, 7, 8].forEach((_, index) => {
				var emptybox = this.add
					.image(this.boxImage.x + xBox + Math.floor(index % 4) * 100, this.boxImage.y + yBox + 20 + Math.floor(index / 4) * 150, CST.IMAGES.D_BLANK)
					.setScale(0.6);
			});
		} else {
			this.roomTitle = this.add.text(this.boxImage.x - 125, this.boxImage.y - 195, getTranslate("waitingRoom.participants"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "20px",
				align: "center",
				color: "#FFF",
			});
		}
		if (this.screenType == "createroom") {
			// this.add.image(this.boxImage.x + (this.screenType == "createroom" ? 105 : 180), this.boxImage.y + 50, CST.IMAGES.WHITE_BACK).setScale(0.6, 0.7);
		} else {
			this.add.image(this.boxImage.x + (this.screenType == "createroom" ? 105 : 180), this.boxImage.y + 50, CST.IMAGES.WHITE_BACK).setScale(0.8);
		}

		this.userName = this.add.text(this.boxImage.x, this.boxImage.y - 180, getUserInfo().name, {
			fontFamily: "ArcherBook",
			fontSize: "20px",
			align: "center",
			color: "#FFF",
		});
		this.userName.setX(this.userName.x - this.userName.width / 2 - (this.screenType == "createroom" ? backImageWidth * 4.1 : backImageWidth * 4.5));

		this.goBack = this.add
			.image(
				this.boxImage.x - (this.screenType == "createroom" ? 555 : 582),
				this.boxImage.y - (this.screenType == "createroom" ? 261 : 262),
				CST.IMAGES.NEW_BACK
			)
			.setScale(this.screenType == "createroom" ? 0.8 : 0.95)
			.setInteractive({ useHandCursor: true });

		this.goBack
			.on("pointerover", () => {
				this.goBack.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.goBack.clearTint();
			})
			.on("pointerdown", () => {
				this.goBack.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.goBack.clearTint();
				this.setModal(true);
				if (this.screenType == "host") {
					this.RoomId.setVisible(false);
				}
			});

		this.new_Left = this.add
			.image(
				this.boxImage.x - (this.screenType == "createroom" ? 435 : 462),
				this.boxImage.y + (this.screenType == "createroom" ? 28 : 27),
				CST.IMAGES.NEW_LEFT
			)
			.setScale(0.85);
		// .setInteractive({ useHandCursor: true });

		this.new_Left
			.on("pointerover", () => {
				this.new_Left.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.new_Left.clearTint();
			})
			.on("pointerdown", () => {
				this.new_Left.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.new_Left.clearTint();
				if (this.selectedHelmetIndex > 0) {
					this.selectedHelmetIndex -= 1;
					this.selectedHelmet.setTexture("Helmet", this.helmetData[this.selectedHelmetIndex]);
					this.gameSocket.emit(WAITING_ROOM_EVENT_NAMES.SERVER_EVENT.CHANGE_HELMET, { helmetIndex: this.selectedHelmetIndex });
				}
			});

		this.new_right = this.add
			.image(
				this.boxImage.x - (this.screenType == "createroom" ? 150 : 180),
				this.boxImage.y + (this.screenType == "createroom" ? 28 : 27),
				CST.IMAGES.NEW_RIGHT
			)
			.setScale(0.85);
		// .setInteractive({ useHandCursor: true });

		this.new_right
			.on("pointerover", () => {
				this.new_right.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.new_right.clearTint();
			})
			.on("pointerdown", () => {
				this.new_right.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.new_right.clearTint();
				if (this.selectedHelmetIndex < this.helmetData.length - 1) {
					this.selectedHelmetIndex += 1;
					this.selectedHelmet.setTexture("Helmet", this.helmetData[this.selectedHelmetIndex]);
					this.gameSocket.emit(WAITING_ROOM_EVENT_NAMES.SERVER_EVENT.CHANGE_HELMET, { helmetIndex: this.selectedHelmetIndex });
				}
			});

		this.confirmDialog = this.add
			.image(Number(this.game.config.width) / 2, Number(this.game.config.height) / 2.2, CST.IMAGES.CONFIRM_DIALOG)
			.setScale(0.85)
			.setDepth(2)
			.setVisible(false);
		this.closeButton = this.add
			.image(this.confirmDialog.x + 240, this.confirmDialog.y - 130, CST.IMAGES.CLOSE)
			.setScale(0.85)
			.setDepth(2)
			.setInteractive({ useHandCursor: true })
			.setVisible(false);

		this.closeButton
			.on("pointerover", () => {
				this.closeButton.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.closeButton.clearTint();
			})
			.on("pointerdown", () => {
				this.closeButton.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.closeButton.clearTint();
				this.setModal(false);
				if (this.screenType == "host" && this.RoomId) {
					this.RoomId.setVisible(true);
				}
			});

		this.title = this.add
			.text(this.confirmDialog.x, this.confirmDialog.y - 30, getTranslate("waitingRoom.youLeave"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "40px",
				align: "center",
				color: "#FFF",
			})
			.setInteractive({ useHandCursor: true })
			.setDepth(2)
			.setVisible(false);
		this.title.setX(this.title.x - this.title.width / 2);
		this.subTitle = this.add
			.text(this.confirmDialog.x, this.confirmDialog.y + 40, getTranslate("waitingRoom.leaveConfirm"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "20px",
				align: "center",
				color: "#FFF",
			})
			.setInteractive({ useHandCursor: true })
			.setDepth(2)
			.setVisible(false);
		this.subTitle.setX(this.subTitle.x - this.subTitle.width / 2);

		this.quitterBtn = this.add
			.text(this.confirmDialog.x, this.confirmDialog.y + 147, getTranslate("waitingRoom.quit"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "20px",
				align: "center",
				color: "#FFF",
			})
			.setInteractive({ useHandCursor: true })
			.setDepth(2)
			.setVisible(false);
		this.quitterBtn.setX(this.quitterBtn.x - this.quitterBtn.width / 2 - backImageWidth * 1.26);

		this.quitterrect = this.add
			.rectangle(this.confirmDialog.x - 90, this.confirmDialog.y + 155, 140, 45)
			.setInteractive({ useHandCursor: true })
			.setDepth(2)
			.setVisible(false);

		this.quitterrect
			.on("pointerover", () => {
				this.quitterBtn.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.quitterBtn.clearTint();
			})
			.on("pointerdown", () => {
				this.quitterBtn.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.quitScene();
			});

		this.resterBtn = this.add
			.text(this.confirmDialog.x, this.confirmDialog.y + 147, getTranslate("waitingRoom.stay"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "20px",
				align: "center",
				color: "#FFF",
			})
			.setInteractive({ useHandCursor: true })
			.setDepth(2)
			.setVisible(false);
		this.resterBtn.setX(this.resterBtn.x - this.resterBtn.width / 2 + backImageWidth * 1.26);
		this.resterRect = this.add
			.rectangle(this.confirmDialog.x + 92, this.confirmDialog.y + 155, 140, 45)
			.setInteractive({ useHandCursor: true })
			.setDepth(2)
			.setVisible(false);

		this.resterRect
			.on("pointerover", () => {
				this.resterBtn.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.resterBtn.clearTint();
			})
			.on("pointerdown", () => {
				this.resterBtn.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.resterBtn.clearTint();
				this.setModal(false);
				this.RoomId.setVisible(true);
			});

		this.createRoomBack = this.add
			.image(Number(this.game.config.width) / 2.025, Number(this.game.config.height) / 2.2, CST.IMAGES.CREATE_ROOM_DIALOG)
			.setScale(0.85)
			.setVisible(false)
			.setDepth(2);
		this.closeButton1 = this.add
			.image(this.createRoomBack.x + 300, this.createRoomBack.y - 145, CST.IMAGES.CLOSE)
			.setScale(0.85)
			.setInteractive({ useHandCursor: true })
			.setVisible(false)
			.setDepth(2);
		this.closeButton1
			.on("pointerover", () => {
				this.closeButton1.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.closeButton1.clearTint();
			})
			.on("pointerdown", () => {
				this.closeButton1.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.closeButton1.clearTint();
				this.setModal(false);
				this.checkComponent(false);
				this.createRoomCall(false);
				this.createRoom = false;
				if (this.screenType == "host") {
					this.RoomId.setVisible(true);
				}
			});

		this.privateImage = this.add
			.image(this.createRoomBack.x + 100, this.createRoomBack.y - 70, CST.IMAGES.INACTIVE)
			.setScale(0.9)
			.setDepth(2)
			.setVisible(false);
		this.publicImage = this.add
			.image(this.createRoomBack.x - 85, this.createRoomBack.y - 70, CST.IMAGES.ACTIVE)
			.setScale(0.9)
			.setDepth(3)
			.setVisible(false);

		this.lock = this.add
			.image(this.createRoomBack.x + 140, this.createRoomBack.y - 72, CST.IMAGES.LOCK)
			.setScale(0.85)
			.setVisible(false)
			.setDepth(4);
		this.unlock = this.add
			.image(this.createRoomBack.x - 135, this.createRoomBack.y - 72, CST.IMAGES.UNLOCK)
			.setScale(0.85)
			.setVisible(false)
			.setDepth(4);

		this.publicText = this.add
			.text(this.createRoomBack.x, this.createRoomBack.y - 82, getTranslate("waitingRoom.public"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "18px",
				align: "center",
				color: "#FFF",
			})
			.setDepth(4)
			.setInteractive({ useHandCursor: true })
			.setVisible(false);
		this.publicText.setX(this.publicText.x - this.publicText.width / 2 - backImageWidth * 1.15);
		this.publicText.on("pointerup", () => {
			this.publicText.clearTint();
			this.privateImage.setDepth(2);
			this.publicImage.setDepth(3);
			this.isPrivate = false;
			this.publicImage.setTexture(CST.IMAGES.ACTIVE);
			this.privateImage.setTexture(CST.IMAGES.INACTIVE);
		});
		this.privateText = this.add
			.text(this.createRoomBack.x, this.createRoomBack.y - 82, getTranslate("waitingRoom.private"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "18px",
				align: "center",
				color: "#FFF",
			})
			.setDepth(4)
			.setInteractive({ useHandCursor: true })
			.setVisible(false);
		this.privateText.setX(this.privateText.x - this.privateText.width / 2 + backImageWidth * 1.15);

		this.privateText.on("pointerup", () => {
			this.privateText.clearTint();
			this.privateImage.setDepth(3);
			this.publicImage.setDepth(2);
			this.privateImage.setTexture(CST.IMAGES.ACTIVE);
			this.publicImage.setTexture(CST.IMAGES.INACTIVE);
			this.isPrivate = true;
		});

		this.gameDuration = this.add
			.text(this.createRoomBack.x - 190, this.createRoomBack.y - 20, getTranslate("waitingRoom.gameDuration"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "20px",
				align: "center",
				color: "#FFF",
			})
			.setVisible(false)
			.setDepth(2);

		this.timeProgress = this.add
			.image(this.createRoomBack.x + 10, this.createRoomBack.y + 40, CST.IMAGES.VERTICAL)
			.setScale(1)
			.setVisible(false)
			.setInteractive({ useHandCursor: true })
			.setDepth(2);

		for (let index = 0; index < 5; index++) {
			this.timeCircle1 = this.add
				.image(this.timeProgress.x - 194 + index * 97, this.timeProgress.y, CST.IMAGES.DOT)
				.setScale(0.85)
				.setVisible(false)
				.setDepth(2)
				.setScale(1.06)
				.setInteractive({ useHandCursor: true });
			this.timeCircle1.on("pointerup", () => {
				var timeNew = (index + 1) * 5 + 5;
				this.timeBack.x = oneMinute * timeNew + timeBackX - 168;
				this.times.x = oneMinute * timeNew - 21 + timeBackX - 168;
				this.times.setText(`${timeNew} min`);
				this.timeOfTimebar = timeNew;
			});
			this.timeCircleStore.push(this.timeCircle1);
		}
		this.timeBack = this.add
			.image(this.createRoomBack.x - 153, this.createRoomBack.y + 40, CST.IMAGES.R_SMALL)
			.setScale(0.85)
			.setInteractive({ useHandCursor: true })
			.setVisible(false)
			.setDepth(2);
		this.times = this.add
			.text(this.timeBack.x - 21, this.createRoomBack.y + 31, "10 min", {
				fontFamily: "ArcherBook",
				fontSize: "15px",
				align: "center",
				color: "#4C2910",
			})
			.setVisible(false)
			.setDepth(2);
		this.input.setDraggable(this.timeBack);
		var slideWidth = this.timeProgress.width + this.timeProgress.x - 230;
		var timeBackX = this.timeBack.x;
		var oneMinute = (slideWidth - timeBackX) / 20;
		if (this.screenType == "host") {
			this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
				if (dragX >= this.timeProgress.x - 165 && dragX <= slideWidth) {
					var timeValue = (dragX - timeBackX) / oneMinute + 10;
					gameObject.x = dragX;
					this.times.x = dragX - 21;
					var time = Math.round(timeValue);
					this.timeOfTimebar = time;
					this.times.setText(`${time} min`);
				}
			});
		}

		this.nombredejoueurs = this.add
			.text(this.createRoomBack.x - 190, this.createRoomBack.y + 70, getTranslate("waitingRoom.noOfPlayers"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "20px",
				align: "center",
				color: "#FFF",
			})
			.setVisible(false)
			.setDepth(2);
		// this.nombredejoueurs.setX(this.nombredejoueurs.x - this.nombredejoueurs.width / 2);

		this.numberBack = this.add
			.image(this.createRoomBack.x + 10, this.createRoomBack.y + 140, CST.IMAGES.VERTICAL_BIG)
			.setScale(0.85)
			.setVisible(false)
			.setDepth(2);
		this.minus = this.add
			.text(this.createRoomBack.x - 160, this.createRoomBack.y + 120, "-", {
				fontFamily: "ArcherBoldPro",
				fontSize: "30px",
				align: "center",
				color: "#5E3614",
			})
			.setInteractive({ useHandCursor: true })
			.setVisible(false)
			.setDepth(2);
		this.minus.on("pointerup", () => {
			if (this.numberOfPlayer > 2) {
				this.players.setText(Number((this.numberOfPlayer = this.numberOfPlayer - 1)).toString());
			}
		});

		this.players = this.add
			.text(this.createRoomBack.x, this.createRoomBack.y + 120, this.numberOfPlayer.toString(), {
				fontFamily: "ArcherBoldPro",
				fontSize: "30px",
				align: "center",
				color: "#5E3614",
			})
			.setVisible(false)
			.setDepth(2);
		this.plus = this.add
			.text(this.createRoomBack.x + 165, this.createRoomBack.y + 120, "+", {
				fontFamily: "ArcherBoldPro",
				fontSize: "30px",
				align: "center",
				color: "#5E3614",
			})
			.setInteractive({ useHandCursor: true })
			.setVisible(false)
			.setDepth(2);

		this.plus.on("pointerup", () => {
			if (this.numberOfPlayer < 40) {
				this.players.setText(Number((this.numberOfPlayer = this.numberOfPlayer + 1)).toString());
			}
		});

		this.settings = this.add
			.text(this.createRoomBack.x, this.createRoomBack.y - 275, getTranslate("waitingRoom.settings"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "45px",
				align: "center",
				color: "#FFF",
			})
			.setVisible(false)
			.setDepth(2);

		this.settings.setX(this.settings.x - this.settings.width / 2 + backImageWidth * 0.21);

		this.createButton = this.add
			.text(this.createRoomBack.x, this.createRoomBack.y + 244, getTranslate("waitingRoom.apply"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "20px",
				align: "center",
				color: "#FFF",
			})
			.setInteractive({ useHandCursor: true })
			.setVisible(false)
			.setDepth(2);
		this.createButton.setX(this.createButton.x - this.createButton.width / 2 + backImageWidth * 0.31);
		this.createRect = this.add
			.rectangle(this.createRoomBack.x + 25, this.createRoomBack.y + 255, 210, 45)
			.setInteractive({ useHandCursor: true })
			.setVisible(false)
			.setDepth(2);

		this.createRect
			.on("pointerover", () => {
				this.createButton.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.createButton.clearTint();
			})
			.on("pointerdown", () => {
				this.createButton.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.createButton.clearTint();
				this.checkComponent(false);
				this.createRoomCall(false);
				this.createRoom = false;
				this.roomSettings.setInteractive(false);
				this.roomSettingsRect.setInteractive(false);
				if (this.screenType == "host") {
					this.RoomId.setVisible(true);
				}
				if (this.iscreateRoom) {
					this.gameSocket.emit(ROOM_EVENT_NAMES.CHANGE_ROOM_SETTINGS, <RoomSettings>{
						isPrivate: this.isPrivate,
						maxPlayerCount: this.numberOfPlayer,
						createTime: this.timeOfTimebar,
						type: "host",
					});
				}
			});

		if (this.screenType == "host") {
			// this.RoomId = this.add.text(this.boxImage.x - 120, this.boxImage.y - 190, this.roomId, {
			// 	fontSize: "20px",
			// 	fontFamily: "ArcherBoldPro",
			// 	color: "#FFF",
			// });
			this.RoomId = this.add
				.dom(this.boxImage.x, this.boxImage.y - 190)
				.createFromCache(CST.HTML.HOST_ID)
				.setVisible(true);

			this.warningCharacter = this.add.text(this.boxImage.x - 125, this.boxImage.y - 170, getTranslate("waitingRoom.selectCharacter"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "18px",
				align: "center",
				color: "#FFF",
			});
		}

		this.gameSocket.on(WAITING_ROOM_EVENT_NAMES.CLIENT_EVENT.ROOM_INFO, (data: RoomInfoEvent) => {
			this.usersDTO = data.userDTOs;
			this.roomName.setText(`${getTranslate("waitingRoom.partOf")} ${data.hostName}`);
			if (this.isHostAdd) {
				this.roomName.setX(this.roomName.x - this.roomName.width / 2 - (this.screenType == "createroom" ? backImageWidth : 0));
			}
			this.isHostAdd = false;
			this.roomId = `${getTranslate("waitingRoom.roomId")}: ${data.roomId}`;
			this.hostName = `${getTranslate("waitingRoom.host")}: ${data.hostName}`;
			if (this.screenType == "host") {
				var user_ready = 0;
				for (let i = 0; i < data.userDTOs.length; i++) {
					if (data.userDTOs[i].isReady == true) {
						user_ready += 1;
					}
				}
				var percentage = (100 * user_ready) / data.userDTOs.length;
				this.makeBar(percentage, 100, 0x93278f);

				// var setCopyIcon = userLanguage.includes("en") ? 82 : 130;
				var setCopyIcon = userLanguage.includes("en") ? this.RoomId.width / 3 : this.RoomId.width / 2;
				var coptyText = this.add
					.image(this.boxImage.x + setCopyIcon, this.boxImage.y - 190, CST.IMAGES.COPY)
					.setScale(0.3)
					.setInteractive({ useHandCursor: true });

				coptyText
					.on("pointerover", () => {
						coptyText.setTint(0xffff66);
					})
					.on("pointerout", () => {
						coptyText.clearTint();
					})
					.on("pointerdown", () => {
						coptyText.setTint(0x86bfda);
					})
					.on("pointerup", () => {
						coptyText.clearTint();
						coptyText.setScale(0.35);
						setTimeout(() => {
							coptyText.setScale(0.3);
						}, 800);
						navigator.clipboard.writeText(data.roomId);
					});
			}
			if (this.screenType !== "createroom") {
				// this.updateUsersList();
				this.updatePanel(this.scrollablePanel);
			}
		});

		// "createroom" for solo mode if need to scroll in bots then set condition for x and y coordinates
		if (this.screenType != "createroom") {
			this.scrollablePanel = this.rexUI.add
				.scrollablePanel({
					x: 860,
					y: 460,
					width: 600,
					height: 350,

					scrollMode: 0,
					panel: {
						child: this.rexUI.add.fixWidthSizer({
							width: 580,
							space: {
								left: 3,
								right: 3,
								top: 3,
								bottom: 3,
								item: 31,
								line: 10,
							},
							align: "justify-left",
						}),

						mask: {
							padding: 1,
						},
					},

					slider: {
						track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x8f8f8f),
						thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0xcecece),
					},

					space: {
						left: 0,
						right: 0,
						top: 0,
						bottom: 0,

						panel: 0,
					},
				})
				.layout();
		}

		this.gameSocket.emit(WAITING_ROOM_EVENT_NAMES.SERVER_EVENT.SCENE_LOADED);

		this.startCountdownText = this.add
			.text(630, 250, "", {
				fontFamily: "Courier",
				fontSize: "120px",
				align: "center",
				color: "#FFFFFF",
				fontStyle: "bold",
			})
			.setVisible(false);
		this.startCountdownText.setDepth(2);

		this.countDownBack = this.add
			.image(Number(this.game.config.width) / 2, Number(this.game.config.height) / 2, CST.IMAGES.COUNT_DOWN)
			.setScale(1.5)
			.setDepth(8);
		this.startGameIn = this.add
			.text(this.countDownBack.x, this.countDownBack.y - 144, getTranslate("waitingRoom.startGameIn"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "15px",
				align: "center",
				color: "#FFF",
			})
			.setDepth(9)
			.setVisible(false);
		this.startGameIn.setX(this.startGameIn.x - this.startGameIn.width / 2);
		this.countDown = this.add
			.text(this.countDownBack.x, this.countDownBack.y - 110, "", {
				fontFamily: "Arial",
				fontSize: "180px",
				align: "center",
				color: "#FFF",
			})
			.setDepth(10);
		this.countDownX = this.countDown.x;

		this.cancelLaunch = this.add
			.text(this.countDownBack.x, this.countDownBack.y + 90, getTranslate("waitingRoom.cancelLaunch"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "15px",
				align: "center",
				color: "#FFF",
			})
			.setDepth(10);
		this.cancelLaunch.setX(this.cancelLaunch.x - this.cancelLaunch.width / 2);
		this.cancelGame = this.add
			.rectangle(this.countDownBack.x - 3, this.countDownBack.y + 100, 175, 28)
			.setInteractive({ useHandCursor: true })
			.setDepth(10);

		this.cancelGame
			.on("pointerover", () => {
				this.cancelLaunch.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.cancelLaunch.clearTint();
			})
			.on("pointerdown", () => {
				this.cancelLaunch.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.gameSocket.emit(WAITING_ROOM_EVENT_NAMES.SERVER_EVENT.CANCEL_GAME_INITIALIZATION);
			});

		if (this.screenType == "host") {
			setTimeout(() => {
				this.openCreateRoom();
			}, 400);
		}
	}

	openCreateRoom = () => {
		this.checkComponent(true);
		this.createRoomCall(true);
		this.createRoom = true;
		if (this.screenType == "host") {
			this.RoomId.setVisible(false);
		}
	};

	updatePanel(panel: ScrollablePanel) {
		var sizer: any = panel.getElement("panel");
		var scene = panel.scene;

		if (this.playerBox.length > 0) {
			this.playerBox.forEach((player) => {
				if (this.usersDTO.findIndex((user) => user.userId === player.id) < 0) {
					player.container.destroy();
					this.playerBox = this.playerBox.filter((p) => p.id !== player.id);
				}
			});
		}

		this.usersDTO.forEach((user, index) => {
			var ids = this.getUserId(user.userId);
			if (ids === -1) {
				var container = this.rexUI.add.container(0, 0, 120, 160);
				var image = scene?.add.image(0, 0, CST.IMAGES.MaskMan2).setScale(0.8, 0.84);
				var ready = scene?.add.image(0, 40, CST.IMAGES.READY);
				ready.alpha = 0;
				var name = scene?.add.text(
					-4 - (user.userInfo.name.length - 1) * 3,
					53,
					user.userInfo.name.length >= 13 ? `${user.userInfo.name.substr(0, 12)}...` : user.userInfo.name,
					{
						fontFamily: "ArcherBoldPro",
						fontSize: "15px",
						align: "center",
						color: "#FFF",
					}
				);
				image && container.add(image);
				name && container.add(name);
				ready && container.add(ready);

				sizer.add(container);
				this.playerBox.push({ container: container, id: user.userId });
			} else {
				var container = this.playerBox[ids].container;
				// if (user.isReady) {
				var objects = container.getAllChildren();
				if (objects[2]) {
					(<Phaser.GameObjects.Image>objects[2]).alpha = user.isReady ? 1 : 0;
				}
				// }
			}
		});
		panel.layout();
	}

	makeBar(x, y, color) {
		if (this.progress && this.progress.x) {
			this.progress.destroy();
		}
		this.progress = this.add.graphics();
		this.progress.clear();
		this.progress.fillStyle(color, 1);
		var extra_width;
		var width = (450 * x) / 100;

		if (width != 450) {
			extra_width = 50;
		} else {
			extra_width = 0;
		}
		var borderRadius = width / 2;
		borderRadius = borderRadius > 20 ? 20 : borderRadius;
		this.progress
			.fillRoundedRect(this.energybar.x - 390 + extra_width, this.energybar.y - 115, width, 40, {
				tl: borderRadius,
				tr: borderRadius,
				bl: borderRadius,
				br: borderRadius,
			})
			.setDepth(0);

		this.progress.x = x;
		this.progress.y = y;
		// return bar;
	}

	update() {
		if (this.screenType == "host") {
			(<HTMLInputElement>this.RoomId?.getChildByID("roomId")).value = this.roomId;
		}
		if (this.screenType === "createroom") {
			if (this.botPlayers.length <= 0) {
				this.minusSign.disableInteractive();
				this.minusSign.setAlpha(0.7);
			} else {
				this.minusSign.setInteractive({ useHandCursor: true });
				this.minusSign.setAlpha(1);
			}
			if (this.botPlayers.length >= 8) {
				this.plusSign.disableInteractive();
				this.plusSign.setAlpha(0.7);
			} else {
				this.plusSign.setInteractive({ useHandCursor: true });
				this.plusSign.setAlpha(1);
			}
		}
		this.wobbleAnimDelay += 1;
		var location = { x: this.boxImage.x - (this.screenType == "createroom" ? 290 : 320), y: this.boxImage.y };
		this.updateStartCountdownText();
		this.disableButton();

		if (this.isCharacterImage) {
			const timeline = this.wobbleAnimDelay % (40 + 100) > 40 ? 40 : this.wobbleAnimDelay % (40 + 100);
			const angle = ((2 * Math.PI) / 40) * timeline;
			const wobble = location.y - 8 + Math.cos(angle) * 5;
			this.bottomSprite.x = location.x;
			this.bottomSprite.y = wobble + 38;
			this.character.y = wobble;
			this.character.x = location.x;
			this.selectedHelmet.y = wobble - 85;
			this.selectedHelmet.x = location.x;
		} else {
			this.bottomSprite = this.add.sprite(location.x, location.y + 38, "character", 3).setScale(1.7);
			this.character = this.add.image(location.x, location.y, CST.IMAGES.MaskMan3).setScale(0.9);

			this.selectedHelmet = this.add.sprite(location.x, location.y - 85, "Helmet", this.helmetData[this.selectedHelmetIndex]).setScale(2);

			this.anims.create({
				key: "bottomSprite",
				frames: this.anims.generateFrameNumbers("character", { start: 3, end: 10 }),
				frameRate: 20,
				repeat: -1,
			});
			this.isCharacterImage = true;
			this.bottomSprite.anims.play("bottomSprite");
		}
	}

	private disableButton(): void {
		if (this.isGameInitializing || this.isReadyPlayer) {
			this.new_Left.disableInteractive();
			this.new_right.disableInteractive();
		} else {
			this.new_Left.setInteractive({ useHandCursor: true });
			this.new_right.setInteractive({ useHandCursor: true });
		}
	}

	private updateStartCountdownText(): void {
		if (this.isGameInitializing) {
			const remainingTime = this.preGameToInGameTimestamp - Clock.now();
			this.setStartCountdownText(remainingTime);
			this.countDownBack.setVisible(true);
			this.startGameIn.setVisible(true);
			this.countDown.setVisible(true);
			this.cancelLaunch.setVisible(true);
			this.cancelGame.setVisible(true);
			if (this.screenType === "host" && this.launch && this.launch.x) {
				this.launch.setAlpha(0.5);
				this.startGame.disableInteractive();
			}
		} else {
			this.startCountdownText.setText("");
			this.readyStartGame.setInteractive({ useHandCursor: true });
			this.countDownBack.setVisible(false);
			this.startGameIn.setVisible(false);
			this.countDown.setVisible(false);
			this.cancelLaunch.setVisible(false);
			this.cancelGame.setVisible(false);
			if (this.screenType === "host" && this.launch && this.launch.x) {
				this.launch.setAlpha(1);
				this.startGame.setInteractive({ useHandCursor: true });
			}
		}
	}

	private setStartCountdownText(remainingTime: number): void {
		const approxRemainingTime = Math.ceil(remainingTime / 1000);
		// if (this.screenType == "host") {
		// 	this.launch.setAlpha(0.5);
		// 	this.startGame.disableInteractive();
		// }
		if (this.screenType !== "createroom") {
			this.readyStartGame.disableInteractive();
		}
		if (approxRemainingTime > 0) {
			this.startCountdownText.setText(approxRemainingTime.toString());
			this.countDown.setText(approxRemainingTime.toString());
			this.countDown.setX(this.countDownX - this.countDown.width / 2);
		} else {
			this.startCountdownText.setText("1");
			this.countDown.setText("1");
		}
	}

	private setModal(isShow) {
		this.confirmDialog.setVisible(isShow);
		this.closeButton.setVisible(isShow);
		if (this.screenType == "host") {
			this.RoomId.setVisible(false);
		}
		this.title.setVisible(isShow);
		this.subTitle.setVisible(isShow);
		this.quitterBtn.setVisible(isShow);
		this.quitterrect.setVisible(isShow);
		this.resterBtn.setVisible(isShow);
		this.resterRect.setVisible(isShow);

		this.setBlurBack(isShow);
	}

	setBlurBack(isShow) {
		var aplhaSet = isShow ? 0.5 : 1;
		this.boxImage && this.boxImage?.setAlpha(aplhaSet);
		this.readyGame && this.readyGame?.setAlpha(aplhaSet);
		this.new_Left && this.new_Left?.setAlpha(aplhaSet);
		this.new_right && this.new_right?.setAlpha(aplhaSet);
		this.roomName && this.roomName?.setAlpha(aplhaSet);
		this.userName && this.userName?.setAlpha(aplhaSet);
		this.goBack && this.goBack?.setAlpha(aplhaSet);
		this.character && this.character?.setAlpha(aplhaSet);
		this.bottomSprite && this.bottomSprite?.setAlpha(aplhaSet);
		this.selectedHelmet && this.selectedHelmet?.setAlpha(aplhaSet);
		if (this.screenType == "host") {
			// this.energybar.setAlpha(aplhaSet);
			if (this.launch && this.launch.x) {
				this.launch?.setAlpha(aplhaSet);
			}
			this.progress?.setAlpha(aplhaSet);
			this.roomSettings?.setAlpha(aplhaSet);
		}
	}

	createRoomCall(isCreate) {
		this.createRoomBack.setVisible(isCreate);
		this.createButton.setVisible(isCreate);
		this.createRect.setVisible(isCreate);
	}

	checkComponent(isCreate) {
		this.minus.setVisible(isCreate);
		this.plus.setVisible(isCreate);
		this.settings.setVisible(isCreate);
		this.players.setVisible(isCreate);
		this.nombredejoueurs.setVisible(isCreate);
		this.times.setVisible(isCreate);
		this.timeBack.setVisible(isCreate);
		this.timeProgress.setVisible(isCreate);
		// this.timeCircle1.setVisible(isCreate);
		if (this.screenType === "host") {
			for (let index = 0; index < this.timeCircleStore.length; index++) {
				const element = this.timeCircleStore[index];
				element.setVisible(isCreate);
			}
		}
		this.gameDuration.setVisible(isCreate);
		this.closeButton1.setVisible(isCreate);
		this.privateText.setVisible(isCreate);
		this.publicText.setVisible(isCreate);
		this.privateImage.setVisible(isCreate);
		this.publicImage.setVisible(isCreate);
		this.lock.setVisible(isCreate);
		this.unlock.setVisible(isCreate);
		this.numberBack.setVisible(isCreate);
		// this.createButton.setX(isCreate ? this.createRoomBack.x - 35 : this.createRoomBack.x - 57);
		// this.createButton.setText(isCreate ? getTranslate("roomCreation.createRoom") : getTranslate("waitingRoom.joinGame"));
		this.setBlurBack(isCreate);
	}

	private quitScene() {
		this.gameSocket.removeEventListener(WAITING_ROOM_EVENT_NAMES.CLIENT_EVENT.KICKED);
		this.gameSocket.removeEventListener(WAITING_ROOM_EVENT_NAMES.CLIENT_EVENT.ROOM_INFO);
		this.gameSocket.removeEventListener(WAITING_ROOM_EVENT_NAMES.CLIENT_EVENT.GAME_INITIALIZED);
		this.gameSocket.removeEventListener(WAITING_ROOM_EVENT_NAMES.CLIENT_EVENT.GAME_INITIALIZATION_CANCELED);
		this.gameSocket.close();
		this.scene.start(CST.SCENES.ROOM_CREATION);
	}

	private getUserId(id: string): number {
		return this.playerBox.findIndex((item) => item.id == id);
	}
}

interface PlayerList {
	container: ContainerLite;
	id: string;
}
