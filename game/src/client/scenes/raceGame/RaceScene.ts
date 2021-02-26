import {
	AnswerCorrectedEvent,
	GameEndEvent,
	PlayerLeftEvent,
	QuestionFoundEvent,
	QuestionFoundFromBookEvent,
} from "../../../communication/race/DataInterfaces";
import { CLIENT_EVENT_NAMES as CE } from "../../../communication/race/EventNames";
import { JoinRoomAnswerEvent as JoinRoomAnswerEvent, JoinRoomRequestEvent } from "../../../communication/room/DataInterfaces";
import { ROOM_EVENT_NAMES } from "../../../communication/room/EventNames";
import AffineTransform from "../../../gameCore/race/AffineTransform";
import ClientRaceGameController from "../../../gameCore/race/ClientRaceGameController";
import { PossiblePositions } from "../../../gameCore/race/grid/RaceGrid";
import { ItemType } from "../../../gameCore/race/items/Item";
import Move from "../../../gameCore/race/Move";
import Player from "../../../gameCore/race/player/Player";
import { Answer } from "../../../gameCore/race/question/Answer";
import { Question } from "../../../gameCore/race/question/Question";
import QuestionMapper from "../../../gameCore/race/question/QuestionMapper";
import { CST } from "../../CST";
import { getUserInfo, updateUserHighScore } from "../../services/UserInformationService";
import { LocalizedString } from "./../../Localization";
import { QuestionSceneData } from "./QuestionScene";
import { EventNames, sceneEvents, subscribeToEvent } from "./RaceGameEvents";

export default class RaceScene extends Phaser.Scene {
	//Room
	roomId: string;
	//Loops
	lag: number;
	physTimestep: number;
	//GameCore
	raceGame: ClientRaceGameController;
	//Buffer
	distanceBetweenTwoTiles: number;
	boardPosition: Point;
	keyboardInputs;
	background: Phaser.GameObjects.TileSprite;
	isFollowingPlayer: boolean;
	currentPlayerSprite: Phaser.GameObjects.Sprite;
	pointsForPosition: Phaser.GameObjects.Text[];

	targetLocation: Point;

	currentPlayerMovement: number;
	isReadyToGetPossiblePositions: boolean; //Needed to make sure the program doesn't always recalculate the possible position
	isThrowingBanana: boolean;

	tileActiveState: number;
	tileInactiveState: number;
	activeTileColor: number;

	characterSprites: CharacterSprites[];
	tiles: Phaser.GameObjects.Group;
	items: Phaser.GameObjects.Group;

	//Error
	triedToReconnectAfterSocketError: boolean;

	constructor() {
		const sceneConfig = {
			key: CST.SCENES.RACE_GAME,
		};
		super(sceneConfig);
	}

	preload() {
		this.load.image(CST.IMAGES.ORANGE_SQUARE, CST.IMAGES.ORANGE_SQUARE);
	}

	init(data: any) {
		this.raceGame = data.gameController;
		this.roomId = data.roomId;
		this.lag = 0;
		this.physTimestep = 15; //physics checks every 15ms (~66 times/sec - framerate is generally 60 fps)
		this.characterSprites = [];
		this.pointsForPosition = [];
		this.isFollowingPlayer = true;
		this.isThrowingBanana = false;
		this.currentPlayerMovement = this.raceGame.getCurrentPlayer().getMaxMovementDistance();
		this.activeTileColor = 0xadff2f;
		this.tileInactiveState = 0;
		this.tileActiveState = 1;
		this.triedToReconnectAfterSocketError = false;
		this.handleSocketEvents(this.raceGame.getCurrentPlayerSocket());
	}

	create() {
		this.draggableCameraControls();

		this.background = this.add.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD).setOrigin(0);
		this.background.setScrollFactor(0);

		this.cameras.main.centerOn(0, 0);
		this.keyboardInputs = this.input.keyboard.createCursorKeys();

		this.tiles = this.add.group();
		this.items = this.add.group();

		const gameGrid = this.raceGame.getGrid();

		//TODO : Find a way to store those "Magic Numbers"
		this.distanceBetweenTwoTiles = 66;
		this.boardPosition = { x: <number>this.game.config.width / 2.3, y: <number>this.game.config.height / 7 };

		//creating game board
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
							if (this.raceGame.getCurrentPlayer().getMove().getHasArrived() && !this.raceGame.getCurrentPlayer().isAnsweringQuestion()) {
								this.playerRequestMove(<Point>{ x: x, y: y });
							}
						}
					});
				}
			}
		}

		this.targetLocation = this.raceGame.getCurrentPlayer().getMove().getCurrentRenderedPosition(this.getCoreGameToPhaserPositionRendering());
		this.isReadyToGetPossiblePositions = true;

		this.scene.launch(CST.SCENES.RACE_GAME_UI);

		//Initilalize camera
		this.render();
		this.handleFollowPlayerToggle(this.isFollowingPlayer);

		subscribeToEvent(EventNames.gameResumed, this.resumeGame, this);
		subscribeToEvent(EventNames.gamePaused, this.pauseGame, this);
		subscribeToEvent(EventNames.quitGame, this.quitGame, this);
		subscribeToEvent(EventNames.followPlayerToggle, this.handleFollowPlayerToggle, this);
		subscribeToEvent(EventNames.throwingBananaToggle, this.handleThrowingBananaToogle, this);
		subscribeToEvent(EventNames.useBook, this.useBook, this);
		subscribeToEvent(EventNames.useCrystalBall, this.useItem, this);
		subscribeToEvent(EventNames.answerQuestion, this.answerQuestion, this);
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
		this.renderBackground();
		this.renderPlayerSprites();
		this.renderGameBoard();
		this.renderAccessiblePositions();
	}

	private renderBackground() {
		this.background.setScale(1 / this.cameras.main.zoom, 1 / this.cameras.main.zoom);
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
					characterSprite.sprite.clearTint();
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
				!currentPlayer.isAnsweringQuestion()
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

		socket.on(CE.ANSWER_CORRECTED, (data: AnswerCorrectedEvent) => {
			sceneEvents.emit(EventNames.questionCorrected, data.answerIsRight);
			this.questionCorrected(data.answerIsRight, data.correctionTimestamp);
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
		this.scene.stop(CST.SCENES.REPORT_ERROR);
		this.scene.stop(CST.SCENES.RACE_GAME_UI);
		this.scene.stop(CST.SCENES.QUESTION_WINDOW);
	}

	private activateAccessiblePositions(): void {
		const playerTile = this.getTileFromPhaserPosition(this.targetLocation.x, this.targetLocation.y);
		const possiblePositions = this.raceGame.getPossibleCurrentPlayerMovement({
			x: playerTile.getData("gridPosition").x,
			y: playerTile.getData("gridPosition").y,
		});

		this.clearTileInteractions();

		possiblePositions.forEach((pos: PossiblePositions) => {
			//activating clickable tiles
			const tile = this.getTileFromGridPosition(pos.position.x, pos.position.y);
			tile.setState(this.tileActiveState);
			(<Phaser.GameObjects.Sprite>tile).setTint(this.activeTileColor);

			const distanceToTile = Move.getTaxiCabDistance(pos.position, playerTile.getData("gridPosition"));

			//showing points for each tile
			let points = this.add
				.text(tile.getData("position").x, tile.getData("position").y, this.raceGame.getPointsForMoveDistance(distanceToTile).toString(), {
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
		this.scene.stop(CST.SCENES.IN_GAME_MENU);
		this.scene.stop(CST.SCENES.RACE_GAME_UI);
		this.scene.stop(CST.SCENES.QUESTION_WINDOW);
		this.raceGame.getCurrentPlayerSocket().close();
		this.scene.stop(CST.SCENES.RACE_GAME);
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

	private useBook(questionDifficulty: number, targetLocation: Point): void {
		this.useItem(ItemType.Book);
		this.raceGame.bookUsed(questionDifficulty, targetLocation);
		this.raceGame.getCurrentPlayerSocket().once(CE.QUESTION_FOUND_WITH_BOOK, (data: QuestionFoundFromBookEvent) => {
			sceneEvents.emit(EventNames.newQuestionFound, data);
		});
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
}

interface CharacterSprites {
	playerId: string;
	sprite: Phaser.GameObjects.Sprite;
}
