import { CST } from "../CST";
import { createRoom, joinRoom, connectToRoomSelectionNamespace } from "../services/RoomService";
import BaseScene from "./BaseScene";
import { ROOM_SELECTION_EVENT_NAMES } from "../../communication/roomSelection/EventNames";
import { getTranslate } from "../assets/locales/translate";
import { GameState } from "../../gameCore/gameState/State";
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from "../GameConfig";

const backImageWidth = 72;
export default class RoomCreation extends BaseScene {
	private backButton: Phaser.GameObjects.Image;
	private gameSocket: SocketIOClient.Socket;
	private privateRoomCodeInput: Phaser.GameObjects.DOMElement;
	private listMainImage: Phaser.GameObjects.Image;
	private roomSelectionSocket: SocketIOClient.Socket;
	private refreshButton: Phaser.GameObjects.Image;
	private roomListhtml: Phaser.GameObjects.DOMElement;
	private currentRooms: string[] = [];
	publicRooms: PublicRooms[];
	roomListData: RoomList[];
	isinputHde = null;

	constructor() {
		super({ key: CST.SCENES.ROOM_CREATION });
	}
	init(data: any) {
		this.gameSocket = this.initializeSocket();
		this.roomSelectionSocket = connectToRoomSelectionNamespace();
		this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			this.roomSelectionSocket.close();
		});

		this.isinputHde = data.isinputHde;

		this.publicRooms = [];
		this.roomListData = [];
	}

	create() {
		this.scale.setGameSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
		this.roomSelectionSocket.on(ROOM_SELECTION_EVENT_NAMES.ROOM_UPDATE, (rooms: string[]) => {
			this.playerListUpdate(rooms);
		});
		document.body.style.backgroundImage = 'url("static/client/assets/images/New_Background.png")';
		// this.add.image(Number(this.game.config.width) / 2, Number(this.game.config.height) / 2, CST.IMAGES.NEW_BACKGROUND).setScale(0.71, 0.713);
		this.listMainImage = this.add
			.image(Number(this.game.config.width) / 2 + 40, Number(this.game.config.height) / 1.9, CST.IMAGES.ROOM_CREATION_BACK)
			.setScale(0.75);

		if (!this.isinputHde) {
			this.add
				.text(this.listMainImage.x - 528, this.listMainImage.y - 115, getTranslate("roomCreation.playSolo"), {
					fontSize: "22px",
					align: "center",
					fontFamily: "ArcherBoldPro",
					color: "#1A0E04",
				})
				.setAlpha(0.5);

			var modeSolo = this.add.rectangle(this.listMainImage.x - 470, this.listMainImage.y + 15, 200, 430).setInteractive({ useHandCursor: true });
			modeSolo.on("pointerup", () => {
				const numberOfPlayers = Number(1);
				const isPrivate = true;
				createRoom(this.gameSocket, { isPrivate, maxPlayerCount: numberOfPlayers, createTime: 10, type: "createroom" });
			});

			this.roomListhtml = this.add.dom(this.listMainImage.x + 70, this.listMainImage.y + 70).createFromCache(CST.HTML.ROOM_ID);
		}
		this.sound.add(CST.SOUND.TransitionInterfaces_04).play();
		var gameListTitle = this.add.text(this.listMainImage.x, this.listMainImage.y - 325, getTranslate("roomCreation.listOfParties"), {
			fontFamily: "ArcherBoldPro",
			fontSize: "28px",
			align: "center",
			color: "#FFF",
		});
		gameListTitle.setX(gameListTitle.x - gameListTitle.width / 2 + backImageWidth);

		this.backButton = this.add
			.image(this.listMainImage.x - 390, this.listMainImage.y - 245, CST.IMAGES.NEW_BACK)
			.setScale(0.8)
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

		var accessPrivate = this.add.text(this.listMainImage.x, this.listMainImage.y - 200, getTranslate("roomCreation.accessPrivate"), {
			fontFamily: "ArcherBoldPro",
			fontSize: "18px",
			align: "center",
			fontStyle: "bold",
			color: "#FFF",
		});
		accessPrivate.setX(accessPrivate.x - accessPrivate.width / 2 + backImageWidth);

		this.add.image(this.listMainImage.x + 70, this.listMainImage.y - 130, CST.IMAGES.WHITE).setScale(0.74);

		this.privateRoomCodeInput = this.add
			.dom(this.listMainImage.x - 50, this.listMainImage.y - 135)
			.createFromCache(CST.HTML.ROOM_INPUT)
			.setVisible(this.isinputHde ? false : true);
		(<HTMLInputElement>this.privateRoomCodeInput.getChildByName("roomField")).placeholder = getTranslate("roomCreation.enterRoom");

		var joinRooms = this.add
			.text(this.listMainImage.x, this.listMainImage.y - 144, getTranslate("roomCreation.join"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "14px",
				align: "center",
				fontStyle: "bold",
				color: "#FFF",
			})
			.setInteractive({ useHandCursor: !this.isinputHde });
		joinRooms.setX(joinRooms.x - joinRooms.width / 2 + backImageWidth * 4.12);

		if (!this.isinputHde) {
			joinRooms
				.on("pointerover", () => {
					joinRooms.setTint(0xffff66);
				})
				.on("pointerout", () => {
					joinRooms.clearTint();
				})
				.on("pointerdown", () => {
					joinRooms.setTint(0x86bfda);
				})
				.on("pointerup", () => {
					joinRooms.clearTint();
					const roomId = (<HTMLInputElement>this.privateRoomCodeInput.getChildByName("roomField")).value;
					if (roomId) {
						joinRoom(this.gameSocket, roomId.toUpperCase());
					}
				});
		}

		this.add.image(this.listMainImage.x + 70, this.listMainImage.y + 65, CST.IMAGES.RECTANGLE6).setScale(0.74, 0.85);
		var accessPublic = this.add.text(this.listMainImage.x, this.listMainImage.y - 70, getTranslate("roomCreation.accessPublic"), {
			fontFamily: "ArcherBoldPro",
			fontSize: "18px",
			align: "center",
			fontStyle: "bold",
			color: "#FFF",
		});
		accessPublic.setX(accessPublic.x - accessPublic.width / 2 + backImageWidth * 0.8);
		this.refreshButton = this.add
			.image(this.listMainImage.x + accessPublic.width + 10, this.listMainImage.y - 60, CST.IMAGES.REFRESH)
			.setScale(0.75)
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
		var createNewRoom = this.add
			.text(this.listMainImage.x, this.listMainImage.y + 258, getTranslate("roomCreation.createRoom"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "16px",
				fontStyle: "bold",
				align: "center",
				color: "#FFF",
			})
			.setInteractive({ useHandCursor: this.isinputHde == false || this.isinputHde == undefined ? true : false });
		createNewRoom.setX(createNewRoom.x - createNewRoom.width / 2 + backImageWidth * 0.9);
		let createRoom1 = this.add
			.rectangle(this.listMainImage.x + 65, this.listMainImage.y + 267, 170, 35)
			.setInteractive({ useHandCursor: !this.isinputHde });

		if (!this.isinputHde) {
			createRoom1
				.on("pointerover", () => {
					createNewRoom.setTint(0xffff66);
				})
				.on("pointerout", () => {
					createNewRoom.clearTint();
				})
				.on("pointerdown", () => {
					createNewRoom.setTint(0x86bfda);
				})
				.on("pointerup", () => {
					createNewRoom.clearTint();
					createRoom(this.gameSocket, { isPrivate: false, maxPlayerCount: 10, createTime: 10, type: "host" });
				});
		}
	}

	update() {
		let roomList = <HTMLInputElement>this.roomListhtml.getChildByID("roomlist");
		this.currentRooms.forEach((room, index) => {
			var roomIds = this.checkRoomId(room.substr(4, 6));
			var joinButton;
			if (roomIds != -1) {
				if (room.includes(GameState.FillFulled)) {
				}
			} else {
				var li = document.createElement("li");
				var leftDiv = document.createElement("div");
				var id = document.createElement("span");
				var available = document.createElement("span");
				joinButton = document.createElement("div");
				var backImg = document.createElement("img");

				li.style.cssText =
					"height:60px; display:flex; align-items: center; justify-content: space-between;position:relative; margin: 7px 0;padding:0 15px;";
				id.style.cssText = "display: block; font-family: PoppinsMedium; font-size: 14px; color: #fff;";
				available.style.cssText = `opacity:${room.includes(GameState.FillFulled) ? 0.5 : 1} ; display: block; color:${
					room.includes(GameState.FillFulled) ? "#ffffff" : "#C04A9C"
				} ; font-family: PoppinsMedium; font-size: 12px; fontStyle: bold;`;
				joinButton.style.cssText = `opacity:${
					room.includes(GameState.FillFulled) ? 0.5 : 1
				} ; color: #fff; font-family: ArcherBoldPro; font-size: 15px; position:relative; z-index:1; width: 110px; text-align: center; margin-right: 11px;`;
				backImg.src = "static/client/assets/images/R_blank.png";
				backImg.style.cssText = "position: absolute; width: 100%; left:0px;transform: scaleX(1.02); z-index:0;";

				id.innerHTML = room.substr(4, 6);
				available.innerHTML = `• ${
					room.includes(GameState.FillFulled) ? getTranslate("roomCreation.notAvailable") : getTranslate("roomCreation.available")
				}`;
				joinButton.innerHTML = getTranslate("roomCreation.join");

				joinButton.classList.add(`joinButton`);
				joinButton.onclick = () => {
					if (!room.includes(GameState.FillFulled)) {
						joinRoom(this.gameSocket, room.substr(4, 6));
					}
				};

				leftDiv.appendChild(id);
				leftDiv.appendChild(available);
				li.appendChild(leftDiv);
				li.appendChild(joinButton);
				li.appendChild(backImg);
				if (roomList) {
					roomList.appendChild(li);
				}
				this.roomListData.push({
					id: room.substr(4, 6),
				});
			}
		});
	}

	private checkRoomId(roomId: any) {
		return this.roomListData.findIndex((item) => item.id == roomId);
	}

	private getRoomIndex(roomId: string): number {
		return this.publicRooms.findIndex((item) => item.roomId == roomId);
	}

	private playerListUpdate(rooms: string[]) {
		this.publicRooms.forEach((item, index) => {
			item.back.destroy();
			item.roomName.destroy();
			item.dot.destroy();
			item.status.destroy();
			item.joined.destroy();
		});
		this.publicRooms = [];
		this.currentRooms = rooms.filter((room) => !room.includes(GameState.RaceGame));
		let roomList = <HTMLInputElement>this.roomListhtml.getChildByID("roomlist");
		if (roomList) {
			roomList.innerHTML = "";
		}
		this.roomListData = [];
	}
}

interface PublicRooms {
	back: Phaser.GameObjects.Image;
	roomName: Phaser.GameObjects.Text;
	dot: Phaser.GameObjects.Image;
	status: Phaser.GameObjects.Text;
	joined: Phaser.GameObjects.Text;
	roomId: string;
}

interface RoomList {
	id: any;
}
