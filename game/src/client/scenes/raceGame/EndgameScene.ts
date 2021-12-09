import { CST } from "../../CST";
import RaceScene from "./RaceScene";
import Player from "../../../gameCore/race/player/Player";
import { GameOptions } from "../../../communication/room/EventInterfaces";
import { getTranslate, userLanguage } from "../../assets/locales/translate";
export default class EndGameUIScene extends Phaser.Scene {
	backImage: Phaser.GameObjects.Image;
	backToRoom: Phaser.GameObjects.Text;
	backToRoomRect: Phaser.GameObjects.Rectangle;
	initialTime: any = null;
	seconds: any = 5;
	partInSeconds: any = null;
	initialTimeTexts: Phaser.GameObjects.Text;
	listHtml: Phaser.GameObjects.DOMElement;
	setTime: any = new Date();
	initialTimeSet: any = 0;

	constructor() {
		super({ key: CST.SCENES.End_GameUI });
	}
	create() {
		const raceScene: RaceScene = <RaceScene>this.scene.get(CST.SCENES.RACE_GAME);
		this.backImage = this.add
			.image(Number(this.game.config.width) / 2, Number(this.game.config.height) / 1.95, CST.IMAGES.ENDGAME_BACK)
			.setScale(0.9);
		var goBack = this.add
			.image(this.backImage.x - 553, this.backImage.y - 340, CST.IMAGES.NEW_BACK)
			.setScale(0.95)
			.setInteractive({ useHandCursor: true });

		goBack
			.on("pointerover", () => {
				goBack.setTint(0xffff66);
			})
			.on("pointerout", () => {
				goBack.clearTint();
			})
			.on("pointerdown", () => {
				goBack.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				goBack.clearTint();
				this.scene.start(CST.SCENES.ROOM_CREATION, { isinputHde: false });
			});

		this.initialTimeSet = Math.round(new Date().getTime() / 1000 - this.setTime.getTime() / 1000);

		this.initialTime = this.seconds;

		// Each 1000 ms call onEvent
		this.time.addEvent({ delay: 1000, callback: this.onEvent, callbackScope: this, loop: true });

		var returnToRoom = this.add.text(this.backImage.x, this.backImage.y - 359, getTranslate("endGame.returnToRoom"), {
			fontFamily: "ArcherBoldPro",
			fontSize: "15px",
			align: "center",
			color: "#fff",
			fontStyle: "bold",
		});
		returnToRoom.setX(returnToRoom.x - returnToRoom.width / 2 + 50);

		this.initialTimeTexts = this.add.text(this.backImage.x, this.backImage.y - 310, this.formatTime(this.initialTime), {
			fontFamily: "Arial",
			fontSize: "15px",
			align: "center",
			color: "#24DACF",
			fontStyle: "bold",
		});
		this.initialTimeTexts.setX(this.initialTimeTexts.x - this.initialTimeTexts.width / 2 + 50);

		this.backToRoom = this.add
			.text(this.backImage.x, this.backImage.y + 307, getTranslate("endGame.backToRoom"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "16px",
				align: "center",
				color: "#fff",
				fontStyle: "bold",
			})
			.setAlpha(0.6);
		this.backToRoom.setX(this.backToRoom.x - this.backToRoom.width / 2 + 50);

		this.backToRoomRect = this.add.rectangle(this.backImage.x, this.backImage.y + 320, 280, 35);
		// .setVisible(false);
		this.backToRoomRect.setX(this.backToRoomRect.x - this.backToRoomRect.width / 2 + 190);
		this.backToRoomRect
			.on("pointerover", () => {
				this.backToRoom.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.backToRoom.clearTint();
			})
			.on("pointerdown", () => {
				this.backToRoom.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.backToRoom.clearTint();
				this.scene.start(CST.SCENES.ROOM_CREATION, { isinputHde: false });
			});

		this.GameUsersList();
	}
	private GameUsersList(): void {
		this.listHtml = this.add.dom(this.backImage.x + 25, this.backImage.y - 270).createFromCache(CST.HTML.ENDGAME_LIST);

		const raceScene: RaceScene = <RaceScene>this.scene.get(CST.SCENES.RACE_GAME);
		var point = [];
		raceScene.raceGame.getPlayers().forEach((player: Player, index) => {
			point.push(player.getPlayerState().points);
		});
		raceScene.raceGame.getPlayers().sort(function (a, b) {
			return Number(b.getPlayerState().points) - Number(a.getPlayerState().points);
		});
		this.sliceIntoChunks(raceScene.raceGame.getPlayers(), 10);
	}

	sliceIntoChunks(arr, chunkSize) {
		const res = [];

		var list = <HTMLInputElement>this.listHtml.getChildByID("endGameList");
		for (let i = 0; i < arr.length; i += chunkSize) {
			const chunk = arr.slice(i, i + chunkSize);
			res.push(chunk);
			var ul = document.createElement("ul");
			ul.style.cssText = "padding: 0 20px 0 0; flex: 0 0 49%; list-style: none;";
			for (let index = 0; index < chunk.length; index++) {
				const player = chunk[index];
				var li = document.createElement("li");
				var div = document.createElement("div");
				var numbers = document.createElement("div");
				var backImg = document.createElement("img");
				var name = document.createElement("p");
				var buttonText = document.createElement("h5");
				var points = document.createElement("h5");
				li.style.cssText = "margin: 0 0 5px 0; flex: 200px; position: relative; display: flex; flex-direction: row; align-items: center;";
				div.style.cssText = "display: flex; align-items: center; justify-content: space-between; min-height: 40px;";
				backImg.src = i === 0 && index === 0 ? "static/client/assets/images/game/Row_1.png" : "static/client/assets/images/game/Row_2.png";
				backImg.style.cssText = "position: absolute; width: 91%;";
				name.style.cssText = `color: ${
					i === 0 && index === 0 ? "#93278f" : "#ffffff"
				}; margin-left: 50px; position:absolute; font-size: 14px; font-family: ArcherBoldPro;`;
				buttonText.style.cssText = `position: absolute; top: -2px; right:${
					userLanguage.includes("en") ? "22%" : "18.5%"
				} ; font-size: 11px; font-family: ArcherBoldPro;`;
				points.style.cssText = `color: ${i === 0 && index === 0 ? "#93278f" : "#ffffff"}; position: absolute; left: 87%`;
				numbers.style.cssText = `font-size: 20px; text-align: right; font-family: ArcherBoldPro; height: 36px; width: 36px; margin:0 10px 0 0; display: flex; align-items: center; justify-content: center; background-color:${
					(index === 0 || index === 1 || index === 2) && i === 0 ? "#C69C6D" : "transparent"
				} ; color: #fff; border-radius: 50%;`;

				name.innerHTML = player.getPlayerState().name;
				buttonText.innerHTML = i === 0 && index === 0 ? getTranslate("endGame.roomRecord") : "";
				points.innerHTML = `${player.getPlayerState().points.toString()} pts`;
				numbers.innerHTML = ((i + 1) * index + 1).toString();
				div.appendChild(backImg);
				div.appendChild(name);
				div.appendChild(buttonText);
				div.appendChild(points);
				li.appendChild(numbers);
				li.appendChild(div);
				ul.appendChild(li);
			}
			list.appendChild(ul);
		}
		return res;
	}

	formatTime(seconds) {
		if (seconds != 0) {
			// Seconds
			this.partInSeconds = seconds % 60;
			// Adds left zeros to seconds
			this.partInSeconds = this.partInSeconds.toString().padStart(2, "0");
			// Returns formated time
			return `${this.partInSeconds}s`;
		}
	}

	onEvent() {
		var newTime = Math.round(new Date().getTime() / 1000 - this.setTime.getTime() / 1000);
		if (this.initialTime > 0) {
			this.initialTime = this.seconds - (newTime - this.initialTimeSet); // One second
			this.initialTimeTexts.setText(this.formatTime(this.initialTime));
		} else {
			this.initialTimeTexts.setText("00s");
			this.backToRoomRect.setInteractive({ useHandCursor: true });
			this.backToRoom.setAlpha(1);
		}
	}
}
