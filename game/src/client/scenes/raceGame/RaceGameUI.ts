import { CST } from "../../CST";
import { EventNames, sceneEvents, subscribeToEvent } from "./RaceGameEvents";
import RaceScene from "./RaceScene";
import Player from "../../../gameCore/race/player/Player";
import { getTranslate } from "../../assets/locales/translate";
import { StatusType } from "../../../gameCore/race/player/playerStatus/StatusType";

export default class RaceGameUI extends Phaser.Scene {
	gameDuration: number;
	disabledInteractionZone: Phaser.GameObjects.Zone;
	classment: ClassMent[];
	startCountdownText: Phaser.GameObjects.Text;
	remainingTimeText: Phaser.GameObjects.Text;
	remainingTimeLabelText: Phaser.GameObjects.Text;
	startOptionsButton: Phaser.GameObjects.Image;
	startOptionsButton1: Phaser.GameObjects.Image;
	Right_top: Phaser.GameObjects.Image;
	isFollowingPlayer: boolean;
	isThrowingBanana: boolean;
	followPlayerText: Phaser.GameObjects.Text;
	playerStatusText: Phaser.GameObjects.Text;
	playerStatusTime: Phaser.GameObjects.Text;
	playerStatus: Phaser.GameObjects.Image;
	texts: Phaser.GameObjects.Text;
	//zoom options
	zoomInButton: Phaser.GameObjects.Text;
	zoomOutButton: Phaser.GameObjects.Text;
	bottom: Phaser.GameObjects.Image;
	//playerItems
	bananaText: Phaser.GameObjects.Text;
	bananaCount: Phaser.GameObjects.Text;
	bookText: Phaser.GameObjects.Text;
	bookCount: Phaser.GameObjects.Text;
	crystalBallText: Phaser.GameObjects.Text;
	crystalBallCount: Phaser.GameObjects.Text;
	throwBananaText: Phaser.GameObjects.Text;
	pointsText: Phaser.GameObjects.Text;
	pointsTotal: Phaser.GameObjects.Text;
	pointsTotal1: Phaser.GameObjects.Text;
	pointsTotal2: Phaser.GameObjects.Text;
	pointsTotal3: Phaser.GameObjects.Text;
	initialTime: any = null;
	seconds: any = null;
	partInSeconds: any = null;
	sounds: Phaser.GameObjects.Image;
	music: Phaser.GameObjects.Image;
	sounds_button: Phaser.GameObjects.Image;
	music_button: Phaser.GameObjects.Image;
	is_sound_on: boolean = true;
	is_music_on: boolean = true;
	banane: Phaser.GameObjects.Image;
	cloudJar: Phaser.GameObjects.Image;
	USBJar: Phaser.GameObjects.Image;
	bulbJar: Phaser.GameObjects.Image;
	cloud: Phaser.GameObjects.Image;
	USB: Phaser.GameObjects.Image;
	bulb: Phaser.GameObjects.Image;
	cloudCount: Phaser.GameObjects.Text;
	USBCount: Phaser.GameObjects.Text;
	bulbCount: Phaser.GameObjects.Text;
	private classListHtml: Phaser.GameObjects.DOMElement;
	energyBar: Phaser.GameObjects.Graphics;
	top: Phaser.GameObjects.Image;
	playerCount: Phaser.GameObjects.Text;
	playerCountX: any = 0;
	OnOff_MusiqueSons_13: Phaser.Sound.BaseSound;
	Musique_Nuage: Phaser.Sound.BaseSound;
	Batterie_06: Phaser.Sound.BaseSound;
	Musique_Batterie: Phaser.Sound.BaseSound;
	CleUSB_Entree_08: Phaser.Sound.BaseSound;
	cloud_sound: Phaser.Sound.BaseSound;
	ranking: Phaser.GameObjects.Text;
	followPlayer: Phaser.GameObjects.Image;
	followCameraBack: Phaser.GameObjects.Image;
	timeProgress = null;
	doubleCount = 1;
	constructor() {
		super({ key: CST.SCENES.RACE_GAME_UI });
	}
	init(data: any) {
		this.classment = [];
	}
	create() {
		document.body.style.backgroundImage = 'url("static/client/assets/images/gameBack.png")';
		const raceScene: RaceScene = <RaceScene>this.scene.get(CST.SCENES.RACE_GAME);
		const currentPlayer = raceScene.raceGame.getCurrentPlayer();
		this.gameDuration = raceScene.raceGame.getGameDuration();

		this.OnOff_MusiqueSons_13 = this.sound.add(CST.SOUND.OnOff_MusiqueSons_13);
		this.Musique_Nuage = this.sound.add(CST.SOUND.Musique_Nuage);
		this.Batterie_06 = this.sound.add(CST.SOUND.Batterie_06);
		this.Musique_Batterie = this.sound.add(CST.SOUND.Musique_Batterie);
		this.CleUSB_Entree_08 = this.sound.add(CST.SOUND.CleUSB_Entree_08);
		this.cloud_sound = this.sound.add(CST.SOUND.cloud_sound);

		this.isFollowingPlayer = true;
		this.isThrowingBanana = false;
		this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).on("down", () => {
			var isVisibleSet = !this.playerStatusText.visible;
			// this.playerStatusText.setVisible(isVisibleSet);
			this.playerStatus.setVisible(isVisibleSet);
			this.playerStatusTime.setVisible(isVisibleSet);
			this.remainingTimeText.setVisible(isVisibleSet);
			// this.remainingTimeLabelText.setVisible(isVisibleSet);
			this.startCountdownText.setVisible(isVisibleSet);
		});

		this.disabledInteractionZone = this.add
			.zone(0, 0, Number(this.game.config.width), Number(this.game.config.height))
			.setInteractive({ useHandCursor: true })
			.setOrigin(0)
			.setScrollFactor(0)
			.setActive(false)
			.setVisible(false);

		//Left Side
		this.banane = this.add
			.image(Number(this.game.config.width) * 0.05, Number(this.game.config.height) * 0.5, CST.IMAGES.TIME_BACK)
			.setScale(0.9)
			.setVisible(false);

		this.playerStatusTime = this.add
			.text(this.banane.x - 25, this.banane.y - 5, Math.floor(currentPlayer.getStatusRemainingTime() / 1000).toString(), {
				fontFamily: "Courier",
				fontSize: "20px",
				align: "center",
				color: "#24DACF",
				fontStyle: "bold",
			})
			.setScrollFactor(0)
			.setVisible(false);
		// this.playerStatusTime.rotation = -0.1;
		this.playerStatus = this.add.image(this.banane.x + 4, this.banane.y - 28, CST.IMAGES.CLOUD_TIME).setScale(0.7);

		//Top
		this.seconds = (raceScene.raceGame.getGameDuration() / 1000).toFixed(0);
		this.top = this.add.image(this.game.renderer.width * 0.5, this.game.renderer.height * 0.09, CST.IMAGES.TOP_IMAGE).setScale(0.85);

		this.remainingTimeText = this.add
			.text(this.top.x - 26, this.top.y + 15, raceScene.raceGame.getTimeRemaining().toString(), {
				fontFamily: "Courier",
				fontSize: "20px",
				align: "center",
				color: "#24DACF",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.startCountdownText = this.add
			.text(600, 200, "", {
				fontFamily: "Courier",
				fontSize: "120px",
				align: "center",
				color: "#FFFFFF",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.timeProgress = setInterval(() => {
			this.energyBar = this.add.graphics();
			this.energyBar.clear();
			this.energyBar.fillStyle(0xa421a1, 1);

			var scores = raceScene.raceGame.getPlayers().map((item, index) => {
				return item.getPlayerState().points;
			});
			const totalScore = scores.reduce((partial_sum, a) => partial_sum + a, 0);
			var percentage = (100 * totalScore) / (raceScene.objectScore * scores.length * this.doubleCount);

			if (totalScore >= raceScene.objectScore * scores.length * this.doubleCount) {
				percentage = 100;
				this.doubleCount *= 2;
			}
			var width = (450 * percentage) / 100;
			// console.log("width:", width);
			var borderRadius = width / 2;
			borderRadius = borderRadius > 10 ? 10 : borderRadius;

			this.energyBar
				.fillRoundedRect(this.top.x - 221, this.top.y - 50, width, 40, { tl: borderRadius, tr: borderRadius, bl: borderRadius, br: borderRadius })
				.setDepth(-1);
		}, 1500);

		//Right Side Start
		this.Right_top = this.add.image(this.game.renderer.width * 0.88, this.game.renderer.height * 0.22, CST.IMAGES.RIGHT_TOP).setScale(0.85);

		this.ranking = this.add.text(this.Right_top.x, this.Right_top.y - 148, getTranslate("raceGame.ranking"), {
			fontFamily: "ArcherBoldPro",
			fontSize: "20px",
			align: "center",
			color: "#FFF",
			fontStyle: "bold",
		});
		this.ranking.setX(this.ranking.x - this.ranking.width / 2 + 5);

		this.classListHtml = this.add
			.dom(this.Right_top.x + 5, this.Right_top.y - 25)
			.createFromCache(CST.HTML.CLASS_LIST)
			.setVisible(!raceScene.isQuestionWindow);

		//Minus
		this.zoomOutButton = this.add
			.text(this.Right_top.x + 71, this.Right_top.y + 103, "-", {
				fontFamily: "ArcherBoldPro",
				fontSize: "37px",
				align: "center",
				color: "#FFF",
			})
			.setScale(0.9)
			.setInteractive({
				useHandCursor: true,
			})
			.setScrollFactor(0);
		this.zoomOutButton
			.on("pointerover", () => {
				this.zoomOutButton.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.zoomOutButton.clearTint();
			})
			.on("pointerdown", () => {
				this.zoomOutButton.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.zoomOutButton.clearTint();
				sceneEvents.emit(EventNames.zoomOut);
			});

		//Plus
		this.zoomInButton = this.add
			.text(this.Right_top.x + 32, this.Right_top.y + 111, "+", {
				fontFamily: "ArcherBoldPro",
				fontSize: "22px",
				align: "center",
				color: "#FFF",
			})
			.setInteractive({
				useHandCursor: true,
			})
			.setScrollFactor(0);

		this.zoomInButton
			.on("pointerover", () => {
				this.zoomInButton.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.zoomInButton.clearTint();
			})
			.on("pointerdown", () => {
				this.zoomInButton.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.zoomInButton.clearTint();
				sceneEvents.emit(EventNames.zoomIn);
			});
		var camera_onX = this.Right_top.x - 5,
			camera_offX = this.Right_top.x - 35;
		this.followCameraBack = this.add.image(this.Right_top.x - 20, this.Right_top.y + 128, CST.IMAGES.CAMERAON_BACK).setScale(0.8);
		this.followPlayer = this.add
			.image(this.isFollowingPlayer ? camera_onX : camera_offX, this.Right_top.y + 129, CST.IMAGES.CAMERA_ON)
			.setScale(0.75)
			.setInteractive({
				useHandCursor: true,
			});
		this.followPlayer.on("pointerup", () => {
			this.isFollowingPlayer = !this.isFollowingPlayer;
			if (this.isFollowingPlayer) {
				this.followCameraBack.setTexture(CST.IMAGES.CAMERAON_BACK);
				this.followPlayer.setTexture(CST.IMAGES.CAMERA_ON);
				this.followPlayer.setX(camera_onX);
			} else {
				this.followCameraBack.setTexture(CST.IMAGES.CAMERAOFF_BACK);
				this.followPlayer.setTexture(CST.IMAGES.CAMERA_OFF);
				this.followPlayer.setX(camera_offX);
			}
			sceneEvents.emit(EventNames.followPlayerToggle, this.isFollowingPlayer);
		});
		//Right Side End

		//bottom
		this.bottom = this.add.image(this.game.renderer.width * 0.55, this.game.renderer.height * 0.9, CST.IMAGES.BOTTOM).setScale(0.85);

		this.startOptionsButton = this.add
			.image(this.bottom.x - 455, this.bottom.y - 30, CST.IMAGES.GAME_SETTING)
			// .setInteractive({
			// 	useHandCursor: true,
			// })
			.setVisible(true)
			.setScale(0.85);

		this.startOptionsButton
			.on("pointerover", () => {
				this.startOptionsButton.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.startOptionsButton.clearTint();
			})
			.on("pointerdown", () => {
				this.startOptionsButton.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.startOptionsButton.clearTint();
				sceneEvents.emit(EventNames.gamePaused);
				this.scene.launch(CST.SCENES.IN_GAME_MENU);
			});
		this.startOptionsButton1 = this.add
			.image(this.bottom.x - 420, this.bottom.y + 40, CST.IMAGES.NEW_BACK)
			.setInteractive({
				useHandCursor: true,
			})
			.setScale(0.85);
		this.startOptionsButton1
			.on("pointerover", () => {
				this.startOptionsButton1.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.startOptionsButton1.clearTint();
			})
			.on("pointerdown", () => {
				this.startOptionsButton1.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.startOptionsButton1.clearTint();
				sceneEvents.emit(EventNames.gamePaused);
				this.scene.launch(CST.SCENES.IN_GAME_MENU);
			});

		//1 start
		this.sounds = this.add
			.sprite(this.bottom.x - 520, this.bottom.y - 30, this.is_sound_on ? CST.IMAGES.SWITCH_ON_BACK : CST.IMAGES.SWITCH_OFF_BACK)
			.setScale(0.85);
		this.music = this.add
			.sprite(this.bottom.x - 520, this.bottom.y + 8, this.is_music_on ? CST.IMAGES.SWITCH_ON_BACK : CST.IMAGES.SWITCH_OFF_BACK)
			.setScale(0.85);

		var switch_onX = this.bottom.x - 510,
			switch_offX = this.bottom.x - 530;
		this.sounds_button = this.add
			.sprite(this.is_sound_on ? switch_onX : switch_offX, this.bottom.y - 30, this.is_sound_on ? CST.IMAGES.SWITCH_ON : CST.IMAGES.SWITCH_OFF)
			.setScale(0.85)
			.setVisible(true)
			.setInteractive({ useHandCursor: true });

		this.music_button = this.add
			.sprite(this.is_music_on ? switch_onX : switch_offX, this.bottom.y + 8, this.is_music_on ? CST.IMAGES.SWITCH_ON : CST.IMAGES.SWITCH_OFF)
			.setScale(0.85)
			.setVisible(true)
			.setInteractive({ useHandCursor: true });

		// //1 End
		this.sounds_button.on("pointerdown", () => {
			if (this.is_sound_on) {
				this.is_sound_on = false;
				this.sounds_button.setX(switch_offX);
				this.sounds.setTexture(CST.IMAGES.SWITCH_OFF_BACK);
				this.sounds_button.setTexture(CST.IMAGES.SWITCH_OFF);
				// this.game.sound.volume = 0;
				raceScene.soundOff(this.is_sound_on, "sound");
				this.OnOff_MusiqueSons_13.stop();
				this.Musique_Nuage.stop();
				this.Batterie_06.stop();
				this.Musique_Batterie.stop();
				this.CleUSB_Entree_08.stop();
				this.cloud_sound.stop();
			} else {
				this.is_sound_on = true;
				this.sounds_button.setX(switch_onX);
				this.sounds.setTexture(CST.IMAGES.SWITCH_ON_BACK);
				this.sounds_button.setTexture(CST.IMAGES.SWITCH_ON);
				// this.game.sound.volume = 0.9;
				raceScene.soundOff(this.is_sound_on, "sound");
			}
		});
		this.music_button.on("pointerdown", () => {
			if (this.is_sound_on) {
				this.OnOff_MusiqueSons_13.play();
			}
			if (this.is_music_on) {
				this.is_music_on = false;
				this.music_button.setX(switch_offX);
				this.music.setTexture(CST.IMAGES.SWITCH_OFF_BACK);
				this.music_button.setTexture(CST.IMAGES.SWITCH_OFF);
				raceScene.soundOff(this.is_music_on, "music");
			} else {
				this.is_music_on = true;
				this.music_button.setX(switch_onX);
				this.music.setTexture(CST.IMAGES.SWITCH_ON_BACK);
				this.music_button.setTexture(CST.IMAGES.SWITCH_ON);
				raceScene.soundOff(this.is_music_on, "music");
			}
		});
		this.cloud = this.add.sprite(this.bottom.x - 238, this.bottom.y - 20, "Items", 6).setScale(0.9);
		this.USB = this.add.sprite(this.bottom.x - 93, this.bottom.y - 20, "Items", 7).setScale(0.9);
		this.bulb = this.add.sprite(this.bottom.x + 50, this.bottom.y - 20, "Items", 2).setScale(0.9);

		this.cloudJar = this.add
			.image(this.bottom.x - 238, this.bottom.y - 26, CST.IMAGES.DARK_JAR)
			.setScale(0.85)
			.setInteractive({ useHandCursor: true });
		this.cloudJar.on("pointerdown", () => {
			const playerItemState = currentPlayer.getInventory().getInventoryState();
			if (playerItemState.bananaCount > 0) {
				if (this.is_sound_on) {
					// this.Musique_Nuage.play();
				}
				sceneEvents.emit(EventNames.throwingBananaToggle);
			}
		});
		// this.cloudJar.alpha = 0.5;
		this.USBJar = this.add.image(this.bottom.x - 93, this.bottom.y - 26, CST.IMAGES.DARK_JAR).setScale(0.85);
		this.bulbJar = this.add.image(this.bottom.x + 50, this.bottom.y - 26, CST.IMAGES.DARK_JAR).setScale(0.85);
		for (let i = 0; i < 3; i++) {
			this.add.image(this.bottom.x - 235 + i * 144, this.bottom.y + 15, CST.IMAGES.CIRCLE).setScale(0.85);
		}
		this.cloudCount = this.add.text(this.bottom.x - 239, this.bottom.y + 4, "0", {
			fontFamily: "ArcherBoldPro",
			fontSize: "15px",
			align: "center",
			color: "#FFF",
			fontStyle: "bold",
		});

		this.USBCount = this.add.text(this.bottom.x - 95, this.bottom.y + 4, "0", {
			fontFamily: "ArcherBoldPro",
			fontSize: "16px",
			align: "center",
			color: "#FFF",
			fontStyle: "bold",
		});

		this.bulbCount = this.add.text(this.bottom.x + 49, this.bottom.y + 4, "0", {
			fontFamily: "ArcherBoldPro",
			fontSize: "15px",
			align: "center",
			color: "#FFF",
			fontStyle: "bold",
		});

		this.pointsTotal = this.add
			.text(this.bottom.x + 369, this.bottom.y - 18, "", {
				fontFamily: "ArcherBoldPro",
				fontSize: "20px",
				align: "center",
				color: "#FFF",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

		this.pointsTotal1 = this.add
			.text(this.bottom.x + 407, this.bottom.y - 18, "", {
				fontFamily: "ArcherBoldPro",
				fontSize: "20px",
				align: "center",
				color: "#FFF",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

		this.pointsTotal2 = this.add
			.text(this.bottom.x + 446, this.bottom.y - 18, "", {
				fontFamily: "ArcherBoldPro",
				fontSize: "20px",
				align: "center",
				color: "#FFF",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

		this.pointsTotal3 = this.add
			.text(this.bottom.x + 483, this.bottom.y - 18, "", {
				fontFamily: "ArcherBoldPro",
				fontSize: "20px",
				align: "center",
				color: "#FFF",
				fontStyle: "bold",
			})
			.setInteractive({ useHandCursor: true });

		this.add
			.text(this.bottom.x + 517, this.bottom.y - 14, "pts", {
				fontFamily: "ArcherBoldPro",
				fontSize: "14px",
				align: "center",
				color: "#FFF",
			})
			.setInteractive({ useHandCursor: true });

		subscribeToEvent(EventNames.gameResumed, this.resumeGame, this);
		subscribeToEvent(EventNames.gamePaused, this.pauseGame, this);
		subscribeToEvent(EventNames.error, this.handleErrors, this);
		subscribeToEvent(EventNames.gameEnds, () => this.scene.stop(), this);
	}

	private getCharacterIndex(playerId: string): number {
		return this.classment.findIndex((item) => item.playerId == playerId);
	}

	closeGame() {
		clearInterval(this.timeProgress);
		this.energyBar.destroy();
		const raceScene = <RaceScene>this.scene.get(CST.SCENES.RACE_GAME);
		this.sound.stopAll();
	}

	update() {
		const raceScene = <RaceScene>this.scene.get(CST.SCENES.RACE_GAME);
		this.zoomInButton.alpha = raceScene.camZoom >= raceScene.maxZoom ? 0.5 : 1;
		this.zoomOutButton.alpha = raceScene.camZoom <= raceScene.minZoom ? 0.5 : 1;
		const currentPlayer = raceScene.raceGame.getCurrentPlayer();
		const currentPlayerStatus = currentPlayer.getCurrentStatus().toString();
		this.classListHtml.setVisible(!raceScene.isQuestionWindow);
		this.Right_top.setVisible(!raceScene.isQuestionWindow);
		this.zoomOutButton.setVisible(!raceScene.isQuestionWindow);
		this.zoomInButton.setVisible(!raceScene.isQuestionWindow);
		this.followCameraBack.setVisible(!raceScene.isQuestionWindow);
		this.followPlayer.setVisible(!raceScene.isQuestionWindow);
		this.ranking.setVisible(!raceScene.isQuestionWindow);
		if (raceScene.isQuestionWindow) {
			this.startOptionsButton.disableInteractive();
			this.startOptionsButton1.disableInteractive();
		} else {
			this.startOptionsButton.setInteractive({ useHandCursor: true });
			this.startOptionsButton1.setInteractive({ useHandCursor: true });
		}
		raceScene.raceGame.getPlayers().sort(function (a, b) {
			return Number(b.getPlayerState().points) - Number(a.getPlayerState().points);
		});

		let classList = <HTMLInputElement>this.classListHtml.getChildByID("classList");
		classList.innerHTML = "";

		raceScene.raceGame.getPlayers().forEach((player: Player, index) => {
			let characterIndex: number = this.getCharacterIndex(player.id);
			var li = document.createElement("li");
			var leftDiv = document.createElement("div");
			var title = document.createElement("h6");
			var progressDiv = document.createElement("div");
			var rightDiv = document.createElement("div");

			li.style.cssText = "display: flex; margin-bottom: 16px;";
			leftDiv.style.cssText = "width: 85%;float: left;";
			title.style.cssText = "margin: 0 0 4px 0; font-size: 12px font-family: ArcherBoldPro";
			progressDiv.style.cssText = "margin: 0;padding: 4px;font-family: ArcherBoldPro;font-size: 12px;background-color: #48DACF; border-radius: 5px;";
			rightDiv.style.cssText =
				"font-size: 15px; text-align: right;font-family:ArcherBoldPro; float: right; height: 43px; width: 50px;font-weight: 700; display: flex; align-items: center; justify-content: center; background-color: #C69C6D; color: #fff; margin: 0 0 0 20px; border-radius: 50%;";
			title.innerHTML = player.getPlayerState().name;
			progressDiv.innerHTML = `${player.getPlayerState().points} pts`;
			progressDiv.classList.add(`progressdiv${player.id}`);
			leftDiv.appendChild(title);
			leftDiv.appendChild(progressDiv);
			li.appendChild(leftDiv);
			rightDiv.innerHTML = (index + 1).toString();
			li.appendChild(rightDiv);
			classList.appendChild(li);
			if (characterIndex != -1) {
				if (currentPlayer.id == player.id) {
					this.playerCount.setText((index + 1).toString());
					this.playerCount.setX(this.playerCountX - this.playerCount.width / 2 + 217);
				}
			} else {
				if (currentPlayer.id == player.id) {
					this.playerCount = this.add.text(this.bottom.x, this.bottom.y - 65, (index + 1).toString(), {
						fontFamily: "ArcherBoldPro",
						fontSize: "80px",
						align: "center",
						color: "#FFF",
						fontStyle: "bold",
					});
					this.playerCountX = this.playerCount.x;
				}
				this.classment.push({
					playerId: player.getPlayerState().id,
				});
			}
		});

		if (currentPlayer.isAnsweringQuestion()) {
			this.disabledInteractionZone.setActive(true).setVisible(true);
		} else {
			this.disabledInteractionZone.setActive(false).setVisible(false);
		}

		//setting remaining time
		const timeRemaining = raceScene.raceGame.getTimeRemaining();
		if (timeRemaining < 0) {
			this.setRemainingTimeText(0);
		} else if (!raceScene.raceGame.getIsGameStarted()) {
			this.setRemainingTimeText(this.gameDuration);
			this.setStartCountdownText(timeRemaining - this.gameDuration);
		} else {
			this.setRemainingTimeText(timeRemaining);
			this.startCountdownText.setText("");
		}
		var batteryTime = Math.floor(currentPlayer.getStatusRemainingTime() / 1000).toString();
		//setting player time status
		if (batteryTime != "0" && Number(batteryTime) > -1) {
			if (!this.Batterie_06.isPlaying && Number(batteryTime) > 58 && this.is_sound_on) {
				this.Batterie_06.play();
			}
			raceScene.soundOff(false, "music");
			this.banane.setVisible(true);
			// this.playerStatusText.setVisible(true);
			this.playerStatus.setVisible(true);
			this.playerStatusTime.setVisible(true);
			const playerStatus = currentPlayer.getCurrentStatus();
			if (playerStatus === StatusType.BananaStatus) {
				this.playerStatus.setTexture(CST.IMAGES.CLOUD_TIME);
				if (!this.Musique_Batterie.isPlaying && this.is_sound_on && !this.Batterie_06.isPlaying && !this.cloud_sound.isPlaying) {
					this.Musique_Batterie.play();
				}
				// this.playerStatusText.setText("Shocked");
			} else {
				this.playerStatus.setTexture(CST.IMAGES.BATTERY_TIME);
				if (!this.Musique_Nuage.isPlaying && this.is_sound_on) {
					this.Musique_Nuage.play();
				}
				// this.playerStatusText.setText("Battery");
			}
			this.playerStatusTime.setText("00" + ":" + (batteryTime.length > 1 ? batteryTime : `0${batteryTime}`));
		} else {
			this.Musique_Batterie.stop();
			this.Musique_Nuage.stop();
			if (this.is_music_on) {
				raceScene.soundOff(true, "music");
			}
			this.banane.setVisible(false);
			// this.playerStatusText.setVisible(false);
			this.playerStatus.setVisible(false);
			this.playerStatusTime.setVisible(false);
		}

		//setting player item count
		const playerItemState = currentPlayer.getInventory().getInventoryState();
		if (playerItemState.bookCount !== Number(this.USBCount.text) && this.is_sound_on) {
			this.CleUSB_Entree_08.play();
		}
		// if (playerItemState.crystalBallCount !== Number(this.bulbCount.text) && this.is_sound_on) {
		// 	this.CleUSB_Entree_08.play();
		// }
		if (playerItemState.bananaCount !== Number(this.cloudCount.text) && this.is_sound_on) {
			this.cloud_sound.play();
		}
		this.cloudCount.setText(playerItemState.bananaCount.toString());
		this.USBCount.setText(playerItemState.bookCount.toString());
		this.bulbCount.setText(playerItemState.crystalBallCount.toString());
		this.cloudJar.alpha = playerItemState.bananaCount === 0 ? 0.5 : 1;
		this.USBJar.alpha = playerItemState.bookCount === 0 ? 0.5 : 1;
		this.bulbJar.alpha = playerItemState.crystalBallCount === 0 ? 0.5 : 1;
		this.cloud.alpha = playerItemState.bananaCount === 0 ? 0.5 : 1;
		this.USB.alpha = playerItemState.bookCount === 0 ? 0.5 : 1;
		this.bulb.alpha = playerItemState.crystalBallCount === 0 ? 0.5 : 1;
		//setting player points
		var number = currentPlayer.getPoints().toString(),
			output = [],
			sNumber = number.toString();
		for (var i = 0, len = sNumber.length; i < len; i += 1) {
			output.push(+sNumber.charAt(i));
		}
		if (output.length == 1) {
			this.pointsTotal3.setText(output[0]);
			this.pointsTotal2.setText("0");
			this.pointsTotal1.setText("0");
			this.pointsTotal.setText("0");
		} else if (output.length == 2) {
			this.pointsTotal3.setText(output[1]);
			this.pointsTotal2.setText(output[0]);
			this.pointsTotal1.setText("0");
			this.pointsTotal.setText("0");
		} else if (output.length == 3) {
			this.pointsTotal3.setText(output[2]);
			this.pointsTotal2.setText(output[1]);
			this.pointsTotal1.setText(output[0]);
			this.pointsTotal.setText("0");
		} else if (output.length == 3) {
			this.pointsTotal3.setText(output[3]);
			this.pointsTotal2.setText(output[2]);
			this.pointsTotal1.setText(output[1]);
			this.pointsTotal.setText(output[0]);
		}
	}

	/**
	 * Set the time to display as remaining time.
	 *
	 * @param remainingTime Time remaining before the game ends in milliseconds
	 */
	private setRemainingTimeText(remainingTime: number): void {
		var minutes = Math.floor((remainingTime / (1000 * 60)) % 60).toFixed(0);
		minutes = minutes.length > 1 ? minutes : `0${minutes}`;
		var seconds = ((remainingTime % 60000) / 1000).toFixed(0);
		seconds = seconds.length > 1 ? seconds : `0${seconds}`;
		this.remainingTimeText.setText(minutes + ":" + seconds);
	}

	private setStartCountdownText(remainingTime: number): void {
		const approxRemainingTime = Math.floor(remainingTime / 1000);
		if (approxRemainingTime > 0) {
			this.startCountdownText.setText(approxRemainingTime.toString());
		} else {
			this.startCountdownText.setText("GO!");
		}
	}

	private resumeGame() {
		this.input.enabled = true;
	}

	private pauseGame() {
		this.input.enabled = false;
	}

	private handleErrors(errorType: string): void {
		alert(errorType);
		console.error(errorType);
	}
}

interface ClassMent {
	playerId: string;
}
