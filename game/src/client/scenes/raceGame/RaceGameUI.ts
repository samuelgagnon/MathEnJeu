import { CST } from "../../CST";
import { EventNames, sceneEvents, subscribeToEvent } from "./RaceGameEvents";
import RaceScene from "./RaceScene";

export default class RaceGameUI extends Phaser.Scene {
	gameDuration: number;

	disabledInteractionZone: Phaser.GameObjects.Zone;

	startCountdownText: Phaser.GameObjects.Text;
	remainingTimeText: Phaser.GameObjects.Text;
	remainingTimeLabelText: Phaser.GameObjects.Text;
	startOptionsButton: Phaser.GameObjects.Image;

	isFollowingPlayer: boolean;
	isThrowingBanana: boolean;

	followPlayerText: Phaser.GameObjects.Text;
	playerStatusText: Phaser.GameObjects.Text;
	playerStatusTime: Phaser.GameObjects.Text;

	//zoom options
	zoomInButton: Phaser.GameObjects.Text;
	zoomOutButton: Phaser.GameObjects.Text;

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
		this.gameDuration = raceScene.raceGame.getGameDuration();

		this.isFollowingPlayer = true;
		this.isThrowingBanana = false;

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

		this.remainingTimeText = this.add
			.text(150, 50, raceScene.raceGame.getTimeRemaining().toString(), {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setScrollFactor(0);

		this.remainingTimeLabelText = this.add
			.text(50, 50, "Time: ", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
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
			.setInteractive({
				useHandCursor: true,
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
			.setScrollFactor(0);

		this.followPlayerText = this.add
			.text(50, 500, this.isFollowingPlayer ? "Camera follow: On" : "Camera follow: Off", {
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

		this.zoomInButton = this.add
			.text(50, Number(this.game.config.height) * 0.9, "+", {
				fontFamily: "Courier",
				fontSize: "40px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({
				useHandCursor: true,
			})
			.setScrollFactor(0);

		this.zoomOutButton = this.add
			.text(100, Number(this.game.config.height) * 0.9, "-", {
				fontFamily: "Courier",
				fontSize: "40px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			})
			.setInteractive({
				useHandCursor: true,
			})
			.setScrollFactor(0);

		this.throwBananaText.on("pointerup", () => {
			const newLabel = this.isThrowingBanana ? "Throwing banana: Off" : "Throwing banana: On";
			this.throwBananaText.setText(newLabel);
			this.isThrowingBanana = !this.isThrowingBanana;
			sceneEvents.emit(EventNames.throwingBananaToggle, this.isThrowingBanana);
		});

		this.followPlayerText.on("pointerup", () => {
			this.isFollowingPlayer = !this.isFollowingPlayer;
			const newLabel = this.isFollowingPlayer ? "Camera follow: On" : "Camera follow: Off";
			this.followPlayerText.setText(newLabel);
			sceneEvents.emit(EventNames.followPlayerToggle, this.isFollowingPlayer);
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
			.setScale(0.025)
			.setInteractive({
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

		this.zoomInButton.on("pointerover", () => {
			this.zoomInButton.setTint(0xffff66);
		});

		this.zoomInButton.on("pointerout", () => {
			this.zoomInButton.clearTint();
		});

		this.zoomInButton.on("pointerdown", () => {
			this.zoomInButton.setTint(0x86bfda);
		});

		this.zoomInButton.on("pointerup", () => {
			this.zoomInButton.clearTint();
			sceneEvents.emit(EventNames.zoomIn);
		});

		this.zoomOutButton.on("pointerover", () => {
			this.zoomOutButton.setTint(0xffff66);
		});

		this.zoomOutButton.on("pointerout", () => {
			this.zoomOutButton.clearTint();
		});

		this.zoomOutButton.on("pointerdown", () => {
			this.zoomOutButton.setTint(0x86bfda);
		});

		this.zoomOutButton.on("pointerup", () => {
			this.zoomOutButton.clearTint();
			sceneEvents.emit(EventNames.zoomOut);
		});

		subscribeToEvent(EventNames.gameResumed, this.resumeGame, this);
		subscribeToEvent(EventNames.gamePaused, this.pauseGame, this);
		subscribeToEvent(EventNames.error, this.handleErrors, this);
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

	/**
	 * Set the time to display as remaining time.
	 *
	 * @param remainingTime Time remaining before the game ends in milliseconds
	 */
	private setRemainingTimeText(remainingTime: number): void {
		this.remainingTimeText.setText(Math.floor(remainingTime / 1000).toString());
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
