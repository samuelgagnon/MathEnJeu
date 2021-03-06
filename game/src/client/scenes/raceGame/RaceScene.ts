import { Pinch } from "phaser3-rex-plugins/plugins/gestures.js";
import {
	GameEndEvent,
	ItemUsedEvent,
	PlayerLeftEvent,
	QuestionAnsweredEvent,
	QuestionFoundEvent,
	QuestionFoundFromBookEvent,
} from "../../../communication/race/EventInterfaces";
import { CLIENT_EVENT_NAMES as CE } from "../../../communication/race/EventNames";
import { JoinRoomAnswerEvent as JoinRoomAnswerEvent, JoinRoomRequestEvent } from "../../../communication/room/EventInterfaces";
import { ROOM_EVENT_NAMES } from "../../../communication/room/EventNames";
import AffineTransform from "../../../gameCore/race/AffineTransform";
import ClientRaceGameController from "../../../gameCore/race/ClientRaceGameController";
import RaceGrid, { PossiblePositions } from "../../../gameCore/race/grid/RaceGrid";
import { ItemType } from "../../../gameCore/race/items/Item";
import Move from "../../../gameCore/race/Move";
import Player from "../../../gameCore/race/player/Player";
import { Answer } from "../../../gameCore/race/question/Answer";
import { Question } from "../../../gameCore/race/question/Question";
import QuestionMapper from "../../../gameCore/race/question/QuestionMapper";
import { CST } from "../../CST";
import { getUserInfo, updateUserHighScore } from "../../services/UserInformationService";
import { LapCompletedEvent } from "./../../../communication/race/EventInterfaces";
import { LocalizedString } from "./../../Localization";
import { BackgroundSceneData } from "./BackgroundScene";
import { QuestionSceneData } from "./QuestionScene";
import { EventNames, sceneEvents, subscribeToEvent } from "./RaceGameEvents";

/**
 * This class will render the game board and everything not related to it. That also includes characters, tiles and items on the board.
 * It also controls the interaction with the server. Any action related to the game logic that occured in another scene will be caught
 * by this scene with an event and will be executed here.
 */
export default class RaceScene extends Phaser.Scene {
	//Room
	roomId: string;
	//Loops
	lag: number;
	physTimestep: number = 15; //physics checks every 15ms (~66 times/sec - framerate is generally 60 fps)
	//GameCore
	raceGame: ClientRaceGameController;
	//Buffer
	readonly distanceBetweenTwoTiles: number = 66;
	boardPosition: Point;
	keyboardInputs: Phaser.Types.Input.Keyboard.CursorKeys;
	isFollowingPlayer: boolean = true;
	currentPlayerSprite: Phaser.GameObjects.Sprite;
	pointsForPosition: Phaser.GameObjects.Text[];

	targetLocation: Point;

	currentPlayerMovement: number;
	isReadyToGetPossiblePositions: boolean; //Needed to make sure the scene doesn't always recalculate the possible position
	isThrowingBanana: boolean;

	readonly tileActiveState: number = 1;
	readonly tileInactiveState: number = 0;
	readonly activeTileColor: number = 0xadff2f;

	readonly maxZoom: number = 1.5;
	readonly minZoom: number = 0.8;
	readonly cameraOffset: number = 400;

	characterSprites: CharacterSprites[];
	tiles: Phaser.GameObjects.Group;
	items: Phaser.GameObjects.Group;

	//Error
	triedToReconnectAfterSocketError: boolean;

	constructor() {
		super({ key: CST.SCENES.RACE_GAME });
	}

	preload() {
		this.load.image(CST.IMAGES.ORANGE_SQUARE, CST.IMAGES.ORANGE_SQUARE);
	}

	init(data: any) {
		this.characterSprites = [];
		this.pointsForPosition = [];
		this.isThrowingBanana = false;
		this.lag = 0;
		this.isThrowingBanana = false;
		this.isFollowingPlayer = true;
		this.raceGame = data.gameController;
		this.roomId = data.roomId;
		this.currentPlayerMovement = this.raceGame.getCurrentPlayer().getMaxMovementDistance();
		this.triedToReconnectAfterSocketError = false;
		this.handleSocketEvents(this.raceGame.getCurrentPlayerSocket());
	}

	create() {
		this.scene.launch(CST.SCENES.BACKGROUD, <BackgroundSceneData>{ backgroundImage: CST.IMAGES.BACKGROUD });

		this.draggableCameraControls();

		this.keyboardInputs = this.input.keyboard.createCursorKeys();

		this.tiles = this.add.group();
		this.items = this.add.group();

		const gameGrid = this.raceGame.getGrid();
		this.boardPosition = { x: <number>this.game.config.width * 0.5, y: <number>this.game.config.height * 0.5 };
		this.createGameBoard(gameGrid);

		this.targetLocation = this.raceGame.getCurrentPlayer().getMove().getCurrentRenderedPosition(this.getCoreGameToPhaserPositionRendering());
		this.isReadyToGetPossiblePositions = true;

		this.scene.launch(CST.SCENES.RACE_GAME_UI);

		//RenderBackground behind everything else
		this.scene.sendToBack(CST.SCENES.BACKGROUD);

		//Initilalize camera
		this.render();
		this.createCameraBounds(this.boardPosition.x, this.boardPosition.y, gameGrid.getWidth(), gameGrid.getHeight());
		this.handleFollowPlayerToggle(this.isFollowingPlayer);

		subscribeToEvent(EventNames.gameResumed, this.resumeGame, this);
		subscribeToEvent(EventNames.gamePaused, this.pauseGame, this);
		subscribeToEvent(EventNames.quitGame, this.quitGame, this);
		subscribeToEvent(EventNames.followPlayerToggle, this.handleFollowPlayerToggle, this);
		subscribeToEvent(EventNames.throwingBananaToggle, this.handleThrowingBananaToogle, this);
		subscribeToEvent(EventNames.useBook, this.useItem, this);
		subscribeToEvent(EventNames.useCrystalBall, this.useItem, this);
		subscribeToEvent(EventNames.answerQuestion, this.answerQuestion, this);
		subscribeToEvent(EventNames.zoomIn, this.zoomIn, this);
		subscribeToEvent(EventNames.zoomOut, this.zoomOut, this);
		subscribeToEvent(EventNames.gameEnds, () => this.scene.stop(), this);
	}

	private createGameBoard(gameGrid: RaceGrid) {
		for (let y = 0; y < gameGrid.getHeight(); y++) {
			for (let x = 0; x < gameGrid.getWidth(); x++) {
				const currentTile = gameGrid.getTile({ x, y });
				if (currentTile.isWalkable) {
					let tileSprite: any;

					const positionX = this.boardPosition.x + this.distanceBetweenTwoTiles * x;
					const positionY = this.boardPosition.y + this.distanceBetweenTwoTiles * y;

					if (currentTile.isFinishLine) {
						tileSprite = this.tiles.create(positionX, positionY, CST.IMAGES.FINISH_LINE).setScale(0.045, 0.045);
					} else {
						tileSprite = this.tiles.create(positionX, positionY, CST.IMAGES.ORANGE_SQUARE).setScale(0.3, 0.3);
					}

					tileSprite.setData("gridPosition", <Point>{ x: x, y: y });
					tileSprite.setData("position", <Point>{ x: tileSprite.x, y: tileSprite.y });

					tileSprite.setInteractive();
					tileSprite.on("pointerover", () => {
						if (tileSprite.state === this.tileActiveState) tileSprite.setTint(0x86bfda);
					});
					tileSprite.on("pointerout", () => {
						if (tileSprite.state === this.tileActiveState) tileSprite.setTint(this.activeTileColor);
					});
					tileSprite.on("pointerdown", () => {
						if (tileSprite.state === this.tileActiveState) tileSprite.setTint(0xff0000);
					});
					tileSprite.on("pointerup", () => {
						if (tileSprite.state === this.tileActiveState) {
							tileSprite.setTint(this.activeTileColor);

							//TODO verify if has arrived logic should be moved to player
							if (this.raceGame.getCurrentPlayer().getMove().getHasArrived() && !this.raceGame.getCurrentPlayer().isWorkingOnQuestion()) {
								this.playerRequestMove(<Point>{ x: x, y: y });
							}
						}
					});
				}
			}
		}
	}

	playerRequestMove(targetLocation: Point) {
		//To keep target location in memory when we get the answer from question scene
		this.targetLocation = this.getCoreGameToPhaserPositionRendering().apply(targetLocation);
		this.raceGame.playerMoveRequest(targetLocation);
	}

	update(timestamp: number, elapsed: number) {
		this.cameraKeyboardControls();
		//(i.e time, delta)
		this.lag += elapsed;
		while (this.lag >= this.physTimestep) {
			this.raceGame.update();
			this.lag -= this.physTimestep;
		}
		this.render();
	}

	render() {
		this.renderPlayerSprites();
		this.renderGameBoard();
		this.renderAccessiblePositions();
	}

	private renderPlayerSprites() {
		this.raceGame.getPlayers().forEach((player: Player) => {
			let characterSpriteIndex: number = this.getCharacterSpriteIndex(player.id);
			const currentPosition = player.getMove().getCurrentRenderedPosition(this.getCoreGameToPhaserPositionRendering());

			if (characterSpriteIndex != -1) {
				const characterSprite = this.characterSprites[characterSpriteIndex];
				if (this.isThrowingBanana && player.id !== this.raceGame.getCurrentPlayer().id) {
					characterSprite.sprite.setTint(0xff0000);
					characterSprite.sprite.setInteractive();
				} else {
					if (player.isWorkingOnQuestion()) {
						if (player.isInPenaltyState()) {
							characterSprite.sprite.setTint(0xff00ff);
						} else {
							characterSprite.sprite.setTint(0x0000ff);
						}
					} else {
						characterSprite.sprite.clearTint();
					}
					characterSprite.sprite.disableInteractive();
				}
				characterSprite.sprite.x = currentPosition.x;
				characterSprite.sprite.y = currentPosition.y;
			} else {
				let newCharacterSprite: Phaser.GameObjects.Sprite = this.add
					.sprite(currentPosition.x, currentPosition.y, CST.IMAGES.STAR)
					.setScale(0.08, 0.08);

				if (player.id === this.raceGame.getCurrentPlayer().id) this.currentPlayerSprite = newCharacterSprite;
				this.characterSprites.push({ playerId: player.id, sprite: newCharacterSprite });

				newCharacterSprite.setInteractive();
				newCharacterSprite.on("pointerover", () => {
					newCharacterSprite.setTint(0x86bfda);
				});
				newCharacterSprite.on("pointerout", () => {
					newCharacterSprite.clearTint();
				});
				newCharacterSprite.on("pointerdown", () => {
					newCharacterSprite.setTint(0xff0000);
				});
				newCharacterSprite.on("pointerup", () => {
					newCharacterSprite.clearTint();
					this.isThrowingBanana = false;
					this.useItem(ItemType.Banana, player.id);
				});

				newCharacterSprite.disableInteractive();
			}
		});
	}

	private renderGameBoard() {
		this.items.clear(true, true);
		const gameGrid = this.raceGame.getGrid();

		for (let y = 0; y < gameGrid.getHeight(); y++) {
			for (let x = 0; x < gameGrid.getWidth(); x++) {
				const currentTile = gameGrid.getTile({ x, y });
				const positionX = this.boardPosition.x + this.distanceBetweenTwoTiles * x;
				const positionY = this.boardPosition.y + this.distanceBetweenTwoTiles * y;

				let itemSprite: any;

				const currentItem = currentTile.getItem();

				if (currentItem) {
					let itemType: ItemType;
					switch (currentItem.type) {
						case ItemType.Banana:
							itemSprite = this.items.create(positionX, positionY, CST.IMAGES.BANANA).setScale(0.045, 0.045);
							itemType = ItemType.Banana;
							break;
						case ItemType.Book:
							itemSprite = this.items.create(positionX, positionY, CST.IMAGES.BOOK).setScale(0.045, 0.045);
							itemType = ItemType.Book;
							break;
						case ItemType.Brainiac:
							itemSprite = this.items.create(positionX, positionY, CST.IMAGES.BRAINIAC).setScale(0.045, 0.045);
							itemType = ItemType.Brainiac;
							break;
						case ItemType.CrystalBall:
							itemSprite = this.items.create(positionX, positionY, CST.IMAGES.CRYSTAL_BALL).setScale(0.045, 0.045);
							itemType = ItemType.CrystalBall;
							break;
					}

					itemSprite.setData("type", itemType);
					itemSprite.setData("gridPosition", <Point>{ x: x, y: y });
				}
			}
		}
	}

	private renderAccessiblePositions() {
		if (this.raceGame.getIsGameStarted()) {
			const currentPlayer = this.raceGame.getCurrentPlayer();
			const currentPosition = currentPlayer.getMove().getCurrentRenderedPosition(this.getCoreGameToPhaserPositionRendering());
			if (this.playerHasArrived(currentPosition) && this.isReadyToGetPossiblePositions) {
				this.activateAccessiblePositions();
			} else if (
				//If a player gets affected by a banana or any other state change without moving
				currentPlayer.getMaxMovementDistance() !== this.currentPlayerMovement &&
				this.playerHasArrived(currentPosition) &&
				!currentPlayer.isWorkingOnQuestion()
			) {
				this.currentPlayerMovement = currentPlayer.getMaxMovementDistance();
				this.activateAccessiblePositions();
			}
		}
	}

	private getCharacterSpriteIndex(playerId: string): number {
		return this.characterSprites.findIndex((sprite: CharacterSprites) => sprite.playerId == playerId);
	}

	//The affine transformation needed to render positions might change if there's a resolution change during the game
	//Ex.: Someone playing on mobile changes the mobile orientation from "Portrait" to "Landscape".
	private getCoreGameToPhaserPositionRendering(): AffineTransform {
		return new AffineTransform(this.distanceBetweenTwoTiles, 0, 0, this.distanceBetweenTwoTiles, this.boardPosition.x, this.boardPosition.y);
	}

	useItem(itemType: ItemType, targetPlayerId?: string): void {
		try {
			this.raceGame.itemUsed(itemType, targetPlayerId);
			if (itemType == ItemType.Book) {
				this.raceGame.getCurrentPlayerSocket().once(CE.QUESTION_FOUND_WITH_BOOK, (data: QuestionFoundFromBookEvent) => {
					sceneEvents.emit(EventNames.newQuestionFound, data);
				});
			}
		} catch (e) {
			sceneEvents.emit(EventNames.error, e);
			console.log(e);
			throw e;
		}
	}

	private createQuestionWindow(targetLocation: Point, question: Question): void {
		const questionWindowData: QuestionSceneData = {
			question: question,
			targetLocation: targetLocation,
		};

		this.scene.launch(CST.SCENES.QUESTION_WINDOW, questionWindowData);
	}

	answerQuestion(answer: Answer, position: Point) {
		this.raceGame.clientPlayerAnswersQuestion(answer, <Point>{ x: position.x, y: position.y });
	}

	questionCorrected(isAnswerRight: boolean, correctionTimestamp: number): void {
		this.raceGame.playerAnsweredQuestion(isAnswerRight, this.targetLocation, this.raceGame.getCurrentPlayer().id, correctionTimestamp);
		this.clearTileInteractions();
		if (!isAnswerRight) {
			this.targetLocation = this.getCoreGameToPhaserPositionRendering().apply(this.raceGame.getCurrentPlayer().getPosition());
		}
		this.isReadyToGetPossiblePositions = true;
	}

	private handleSocketEvents(socket: SocketIOClient.Socket): void {
		socket.on(CE.PLAYER_LEFT, (data: PlayerLeftEvent) => {
			this.characterSprites.find((sprite) => data.playerId === sprite.playerId).sprite.destroy();
			this.characterSprites = this.characterSprites.filter((sprite) => data.playerId !== sprite.playerId);
		});

		socket.on(CE.GAME_END, (data: GameEndEvent) => {
			this.endGame();
			this.scene.start(CST.SCENES.WAITING_ROOM, {
				lastGameData: data,
				socket: this.raceGame.getCurrentPlayerSocket(),
			});
		});

		socket.on(CE.QUESTION_FOUND, (data: QuestionFoundEvent) => {
			const questionFound = QuestionMapper.fromDTO(data.questionDTO);
			this.raceGame.getCurrentPlayer().promptQuestion(questionFound);
			this.createQuestionWindow(data.targetLocation, questionFound);
		});

		socket.on(CE.QUESTION_ANSWERED, (data: QuestionAnsweredEvent) => {
			if (data.playerId == this.raceGame.getCurrentPlayer().getId()) {
				this.questionCorrected(data.answerIsRight, data.correctionTimestamp);
				sceneEvents.emit(EventNames.questionCorrected, data.answerIsRight);
			}
			if (data.answerIsRight) {
				console.log(this.raceGame.getCurrentPlayer().getId() + " correctly answered a question.");
			} else {
				console.log(this.raceGame.getCurrentPlayer().getId() + " failed a question.");
			}
		});

		socket.on(CE.LAP_COMPLETED, (data: LapCompletedEvent) => {
			console.log(data.playerId + " completed a lap.");
		});

		socket.on(CE.ITEM_USED, (data: ItemUsedEvent) => {
			console.log(data.fromPlayerId + " used " + data.itemType + " on " + data.targetPlayerId);
		});

		socket.on("connect_error", (error) => {
			this.handleSocketError(error);
		});
		socket.on("error", (error) => {
			this.handleSocketError(error);
		});

		socket.once(ROOM_EVENT_NAMES.JOIN_ROOM_ANSWER, (data: JoinRoomAnswerEvent) => {
			if (data.error) {
				//Dans le cas où la reconnexion à la présente salle a été refusée.
				this.abortGame();
			} else {
				//Dans le cas où la reconnexion à la présente salle a été acceptée.
				this.endGame();
				this.scene.start(CST.SCENES.WAITING_ROOM, { socket: socket });
			}
		});
	}

	private handleSocketError(error): void {
		if (this.raceGame.hasServerStoppedSendingUpdates()) {
			if (!this.triedToReconnectAfterSocketError) {
				this.raceGame.getCurrentPlayerSocket().emit(ROOM_EVENT_NAMES.JOIN_ROOM_REQUEST, <JoinRoomRequestEvent>{ roomId: this.roomId });
				this.triedToReconnectAfterSocketError = true;
			} else {
				this.abortGame();
			}
		}
	}

	private abortGame() {
		const errorMsg: LocalizedString = {
			fr: "Erreur de connexion. Vous avez été éjecté de la salle.",
			en: "Connection error. You've been kicked out of the room.",
		};
		alert(errorMsg[getUserInfo().language]);
		this.quitGame();
	}

	private endGame(): void {
		updateUserHighScore(this.raceGame.getCurrentPlayer().getPoints());
		this.raceGame.gameFinished();
		sceneEvents.emit(EventNames.gameEnds);
	}

	private activateAccessiblePositions(): void {
		const playerTile = this.getTileFromPhaserPosition(this.targetLocation.x, this.targetLocation.y);
		const possiblePositions = this.raceGame.getPossibleCurrentPlayerMovement({
			x: playerTile.getData("gridPosition").x,
			y: playerTile.getData("gridPosition").y,
		});

		const player = this.raceGame.getCurrentPlayer();
		this.clearTileInteractions();

		possiblePositions.forEach((pos: PossiblePositions) => {
			//activating clickable tiles
			const tile = this.getTileFromGridPosition(pos.position.x, pos.position.y);
			tile.setState(this.tileActiveState);
			(<Phaser.GameObjects.Sprite>tile).setTint(this.activeTileColor);

			const distanceToTile = Move.getTaxiCabDistance(pos.position, playerTile.getData("gridPosition"));

			//showing points for each tile
			let points = this.add
				.text(tile.getData("position").x, tile.getData("position").y, player.pointsCalculator(distanceToTile).toString(), {
					fontFamily: "Courier",
					fontSize: "30px",
					color: "#FDFFB5",
					fontStyle: "bold",
				})
				.setVisible(true)
				.setActive(true)
				.setDepth(10)
				.setScrollFactor(1);
			this.pointsForPosition.push(points);
		});

		this.isReadyToGetPossiblePositions = false;
	}

	private clearTileInteractions(): void {
		this.tiles.getChildren().forEach((tile) => {
			(<Phaser.GameObjects.Sprite>tile).clearTint();
			(<Phaser.GameObjects.Sprite>tile).setState(this.tileInactiveState);
		});

		this.pointsForPosition.forEach((points) => {
			points.destroy();
		});
		this.pointsForPosition = [];
	}

	private getTileFromGridPosition(x: number, y: number): Phaser.GameObjects.GameObject {
		return this.tiles.getChildren().find((tile) => tile.getData("gridPosition").x === x && tile.getData("gridPosition").y === y);
	}

	private getTileFromPhaserPosition(x: number, y: number): Phaser.GameObjects.GameObject {
		return this.tiles.getChildren().find((tile) => tile.getData("position").x === x && tile.getData("position").y === y);
	}

	private playerHasArrived(phaserCurrentPosition: Point): boolean {
		return phaserCurrentPosition.x === this.targetLocation.x && phaserCurrentPosition.y === this.targetLocation.y;
	}

	public quitGame(): void {
		this.raceGame.getCurrentPlayerSocket().close();
		sceneEvents.emit(EventNames.gameEnds);
		this.scene.start(CST.SCENES.GAME_SELECTION);
	}

	private pauseGame(): void {
		this.input.enabled = false;
	}

	private resumeGame(): void {
		this.input.enabled = true;
	}

	private handleFollowPlayerToggle(isFollowingPlayer: boolean) {
		this.isFollowingPlayer = isFollowingPlayer;
		if (isFollowingPlayer) {
			this.cameras.main.startFollow(this.currentPlayerSprite, false, 0.09, 0.09);
		} else {
			this.cameras.main.stopFollow();
		}
	}

	private handleThrowingBananaToogle(isThrowingBanana: boolean) {
		this.isThrowingBanana = isThrowingBanana;
	}

	private draggableCameraControls(): void {
		const p = this.input.activePointer;

		this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
			if (!p.isDown || this.isFollowingPlayer) return;

			const cam = this.cameras.main;
			cam.scrollX -= (p.x - p.prevPosition.x) / cam.zoom;
			cam.scrollY -= (p.y - p.prevPosition.y) / cam.zoom;
		});
	}

	private cameraKeyboardControls(): void {
		if (!this.isFollowingPlayer) {
			if (this.keyboardInputs.left.isDown) {
				this.cameras.main.scrollX -= 4;
			} else if (this.keyboardInputs.right.isDown) {
				this.cameras.main.scrollX += 4;
			}

			if (this.keyboardInputs.up.isDown) {
				this.cameras.main.scrollY -= 4;
			} else if (this.keyboardInputs.down.isDown) {
				this.cameras.main.scrollY += 4;
			}
		}
	}

	private zoomIn(): void {
		const cam = this.cameras.main;
		if (cam.zoom < this.maxZoom) {
			cam.zoom += 0.1;
			this.reajustCameraBounds(cam.zoom);
		}
	}

	private zoomOut(): void {
		const cam = this.cameras.main;
		if (cam.zoom > this.minZoom) {
			cam.zoom -= 0.1;
			this.reajustCameraBounds(cam.zoom);
		}
	}

	private createCameraBounds(x: number, y: number, boardWidth: number, boardHeight: number): void {
		let pinch = new Pinch(this);
		pinch.on(
			"pinch",
			(pinch) => {
				var scaleFactor = pinch.scaleFactor;
				this.cameras.main.zoom *= scaleFactor;
			},
			this
		);

		this.cameras.main.setBounds(
			x - this.cameraOffset,
			y - this.cameraOffset,
			(boardWidth - 1) * this.distanceBetweenTwoTiles + 2 * this.cameraOffset,
			(boardHeight - 1) * this.distanceBetweenTwoTiles + 2 * this.cameraOffset
		);
	}

	private reajustCameraBounds(zoomFactor: number): void {
		const yOffset = zoomFactor === this.minZoom ? 75 : this.cameraOffset;

		this.cameras.main.setBounds(
			this.boardPosition.x - zoomFactor * this.cameraOffset,
			this.boardPosition.y - zoomFactor * yOffset,
			(this.raceGame.getGrid().getWidth() - 1) * this.distanceBetweenTwoTiles + 2 * zoomFactor * this.cameraOffset,
			(this.raceGame.getGrid().getHeight() - 1) * this.distanceBetweenTwoTiles + 2 * zoomFactor * yOffset
		);
	}
}

interface CharacterSprites {
	playerId: string;
	sprite: Phaser.GameObjects.Sprite;
}
