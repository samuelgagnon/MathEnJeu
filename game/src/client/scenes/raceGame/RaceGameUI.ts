import { CST } from "../../CST";
import { EventNames, sceneEvents } from "./RaceGameEvents";
import RaceScene from "./RaceScene";

export default class RaceGameUI extends Phaser.Scene {
	disabledInteractionZone: Phaser.GameObjects.Zone;

	remainingTime: Phaser.GameObjects.Text;
	remainingTimeText: Phaser.GameObjects.Text;
	startOptionsButton: Phaser.GameObjects.Image;

	followPlayerText: Phaser.GameObjects.Text;
	playerStatusText: Phaser.GameObjects.Text;
	playerStatusTime: Phaser.GameObjects.Text;

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

	constructor() {
		const sceneConfig = { key: CST.SCENES.RACE_GAME_UI };
		super(sceneConfig);
	}

	create() {
		const raceScene: RaceScene = <RaceScene>this.scene.get(CST.SCENES.RACE_GAME);
		const currentPlayer = raceScene.raceGame.getCurrentPlayer();

		this.playerStatusText = this.add
			.text(50, 100, currentPlayer.getCurrentStatus().toString(), {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.playerStatusTime = this.add
			.text(
				this.playerStatusText.getTopRight().x - 60,
				this.playerStatusText.getTopRight().y,
				Math.floor(currentPlayer.getStatusRemainingTime() / 1000).toString(),
				{
					fontFamily: "Courier",
					fontSize: "32px",
					align: "center",
					color: "#FDFFB5",
					fontStyle: "bold",
				}
			)
			.setScrollFactor(0);

		this.remainingTime = this.add
			.text(150, 50, raceScene.raceGame.getTimeRemaining().toString(), {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.remainingTimeText = this.add
			.text(50, 50, "Time: ", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.bananaText = this.add
			.text(50, 150, "Banana count:", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.bananaCount = this.add
			.text(this.bananaText.getTopRight().x + 10, this.bananaText.getTopRight().y, "0", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.bookText = this.add
			.text(50, 200, "Book count:", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.bookCount = this.add
			.text(this.bookText.getTopRight().x + 10, this.bookText.getTopRight().y, "0", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.crystalBallText = this.add
			.text(50, 250, "Crystal ball count:", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.crystalBallCount = this.add
			.text(this.crystalBallText.getTopRight().x + 10, this.crystalBallText.getTopRight().y, "0", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.throwBananaText = this.add
			.text(50, 300, "Throwing banana: Off", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.pointsText = this.add
			.text(50, 350, "Points: ", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.pointsTotal = this.add
			.text(this.pointsText.getTopRight().x + 10, this.pointsText.getTopRight().y, "Points: ", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({
				useHandCursor: true,
			})
			.setScrollFactor(0);

		this.followPlayerText = this.add
			.text(50, 500, "Camera follow: Off", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({
				useHandCursor: true,
			})
			.setScrollFactor(0);

		this.throwBananaText.on("pointerup", () => {
			if (raceScene.isThrowingBanana) {
				raceScene.isThrowingBanana = false;
			} else {
				raceScene.isThrowingBanana = true;
			}
		});

		this.followPlayerText.on("pointerup", () => {
			if (raceScene.followPlayer) {
				raceScene.followPlayer = false;
				this.followPlayerText.setText("Camera follow: Off");
				raceScene.cameras.main.stopFollow();
			} else {
				raceScene.followPlayer = true;
				this.followPlayerText.setText("Camera follow: On");
				raceScene.cameras.main.startFollow(raceScene.currentPlayerSprite, false, 0.09, 0.09);
			}
		});

		this.disabledInteractionZone = this.add
			.zone(0, 0, Number(this.game.config.width), Number(this.game.config.height))
			.setInteractive()
			.setOrigin(0)
			.setScrollFactor(0)
			.setActive(false)
			.setVisible(false);

		this.startOptionsButton = this.add
			.image(this.game.renderer.width * 0.97, this.game.renderer.height * 0.1, CST.IMAGES.START_OPTIONS)
			.setDepth(1)
			.setScrollFactor(0)
			.setScale(0.025);

		this.startOptionsButton.setInteractive({
			useHandCursor: true,
		});

		this.startOptionsButton.on("pointerover", () => {
			this.startOptionsButton.setTint(0xffff66);
		});

		this.startOptionsButton.on("pointerout", () => {
			this.startOptionsButton.clearTint();
		});

		this.startOptionsButton.on("pointerdown", () => {
			this.startOptionsButton.setTint(0x86bfda);
		});

		this.startOptionsButton.on("pointerup", () => {
			this.startOptionsButton.clearTint();
			sceneEvents.emit(EventNames.gamePaused);
			this.scene.launch(CST.SCENES.IN_GAME_MENU);
		});

		sceneEvents.on(EventNames.gameResumed, this.resumeGame, this);
		sceneEvents.on(EventNames.gamePaused, this.pauseGame, this);
		sceneEvents.on(EventNames.error, this.handleErrors, this);

		this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			sceneEvents.off(EventNames.gameResumed, this.resumeGame, this);
			sceneEvents.off(EventNames.gamePaused, this.pauseGame, this);
		});
	}

	update() {
		const raceScene = <RaceScene>this.scene.get(CST.SCENES.RACE_GAME);
		const currentPlayer = raceScene.raceGame.getCurrentPlayer();
		const currentPlayerStatus = currentPlayer.getCurrentStatus().toString();

		if (currentPlayer.isAnsweringQuestion()) {
			this.disabledInteractionZone.setActive(true).setVisible(true);
		} else {
			this.disabledInteractionZone.setActive(false).setVisible(false);
		}

		const throwBananaText = raceScene.isThrowingBanana ? "Throwing banana: On" : "Throwing banana: Off";
		this.throwBananaText.setText(throwBananaText);

		//setting remaining time
		this.remainingTime.setText(Math.floor(raceScene.raceGame.getTimeRemaining() / 1000).toString());

		//setting player time status
		this.playerStatusText.setText(currentPlayerStatus.toString().substring(0, currentPlayerStatus.length - 6));
		this.playerStatusTime.setText(Math.floor(currentPlayer.getStatusRemainingTime() / 1000).toString());

		//setting player item count
		const playerItemState = currentPlayer.getInventory().getInventoryState();
		this.bananaCount.setText(playerItemState.bananaCount.toString());
		this.bookCount.setText(playerItemState.bookCount.toString());
		this.crystalBallCount.setText(playerItemState.crystalBallCount.toString());

		//setting player points
		this.pointsTotal.setText(currentPlayer.getPoints().toString());
	}

	private resumeGame() {
		this.input.enabled = true;
	}

	private pauseGame() {
		this.input.enabled = false;
	}

	private handleErrors(errorType: string): void {
		console.error(errorType);
	}
}
