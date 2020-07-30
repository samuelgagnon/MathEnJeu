import { GameEndEvent, PlayerLeftEvent } from "../../communication/race/DataInterfaces";
import { CLIENT_EVENT_NAMES as CE } from "../../communication/race/EventNames";
import ClientRaceGameController from "../../gameCore/race/ClientRaceGameController";
import { ItemType } from "../../gameCore/race/items/Item";
import Player from "../../gameCore/race/player/Player";
import { PossiblePositions } from "../../gameCore/race/RaceGrid";
import { CST } from "../CST";

export default class RaceScene extends Phaser.Scene {
	//Loops
	lag: number;
	physTimestep: number;
	//GameCore
	raceGame: ClientRaceGameController;
	//Buffer
	distanceBetweenTwoTiles: number;
	boardPosition: Point;
	keyboardInputs: any;
	background: Phaser.GameObjects.TileSprite;
	followPlayer: boolean;
	currentPlayerSprite: Phaser.GameObjects.Sprite;

	currentPlayerMovement: number;
	isReadyToGetPossiblePositions: boolean; //Needed to make sure the program doesn't always recalculate the possible positions
	isThrowingBanana: boolean;

	tileActiveState: number;
	tileInactiveState: number;
	activeTileColor: number;

	characterSprites: CharacterSprites[];
	tiles: Phaser.GameObjects.Group;
	items: Phaser.GameObjects.Group;

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
		this.lag = 0;
		this.physTimestep = 15; //physics checks every 15ms (~66 times/sec - framerate is generally 60 fps)
		this.characterSprites = [];
		this.followPlayer = false;
		this.isThrowingBanana = false;
		this.currentPlayerMovement = this.raceGame.getCurrentPlayer().getMaxMovementDistance();
		this.activeTileColor = 0xadff2f;
		this.tileInactiveState = 0;
		this.tileActiveState = 1;
		this.handleSocketEvents(this.raceGame.getCurrentPlayerSocket());
	}

	create() {
		this.background = this.add.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD).setOrigin(0);
		this.background.setScrollFactor(0);

		this.cameras.main.centerOn(0, 0);
		this.keyboardInputs = this.input.keyboard.createCursorKeys();

		this.tiles = this.add.group();
		this.items = this.add.group();

		const gameGrid = this.raceGame.getGrid();

		for (let y = 0; y < gameGrid.getHeight(); y++) {
			for (let x = 0; x < gameGrid.getWidth(); x++) {
				const currentTile = gameGrid.getTile({ x, y });
				let tileSprite: any;

				const positionX = <number>this.game.config.width / 2.3 + 96 * x;
				const positionY = <number>this.game.config.height / 7 + 96 * y;

				if (currentTile.isFnishLine) {
					tileSprite = this.tiles.create(positionX, positionY, CST.IMAGES.FINISH_LINE).setScale(0.045, 0.045);
				} else if (currentTile.isStartPosition) {
					tileSprite = this.tiles.create(positionX, positionY, CST.IMAGES.GREEN_SQUARE).setScale(0.1, 0.1);
				} else {
					tileSprite = this.tiles.create(positionX, positionY, CST.IMAGES.ORANGE_SQUARE).setScale(0.3, 0.3);
				}

				tileSprite.setData("name", `tile-(${x},${y})`);
				tileSprite.setData("gridPosition", <Point>{ x: x, y: y });
				tileSprite.setData("position", <Point>{ x: tileSprite.x, y: tileSprite.y });

				tileSprite.setInteractive();
				tileSprite.on("pointerover", () => {
					if (tileSprite.state === this.tileActiveState) tileSprite.setTint(0x86bfda);
				});
				tileSprite.on("pointerout", () => {
					//Problem when moving mouse after clicking and correctly answering question
					if (tileSprite.state === this.tileActiveState) tileSprite.setTint(this.activeTileColor);
				});
				tileSprite.on("pointerdown", () => {
					if (tileSprite.state === this.tileActiveState) tileSprite.setTint(0xff0000);
				});
				tileSprite.on("pointerup", () => {
					if (tileSprite.state === this.tileActiveState) {
						tileSprite.setTint(this.activeTileColor);

						if (this.raceGame.getCurrentPlayer().hasArrived()) {
							this.raceGame.getCurrentPlayer().setIsAnsweringQuestion(true);
							this.createQuestionWindow(<Point>{ x: x, y: y });
						}
					}
				});
			}
		}

		const tiles = this.tiles.getChildren();
		const tile1 = tiles[0];
		const tile2 = tiles[1];
		this.distanceBetweenTwoTiles = Math.sqrt(
			Math.pow(tile2.getData("position").x - tile1.getData("position").x, 2) + Math.pow(tile1.getData("position").y - tile2.getData("position").y, 2)
		);

		this.isReadyToGetPossiblePositions = false;
		this.boardPosition = tile1.getData("position");
		this.activateAccessiblePositions();

		this.scene.launch(CST.SCENES.RACE_GAME_UI);

		//@ts-ignore
		window.myScene = this;
	}

	phys(currentframe: number) {
		this.raceGame.update();
	}

	render() {
		this.background.setScale(1 / this.cameras.main.zoom, 1 / this.cameras.main.zoom);

		if (!this.followPlayer) {
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

		this.raceGame.getPlayers().forEach((player: Player) => {
			let characterSpriteIndex: number = this.getCharacterSpriteIndex(player.id);
			const currentPosition = this.transformToCanvasPosition(player.getPosition());

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

		this.items.clear(true, true);
		const gameGrid = this.raceGame.getGrid();

		for (let y = 0; y < gameGrid.getHeight(); y++) {
			for (let x = 0; x < gameGrid.getWidth(); x++) {
				const currentTile = gameGrid.getTile({ x, y });
				const positionX = <number>this.game.config.width / 2.3 + 96 * x;
				const positionY = <number>this.game.config.height / 7 + 96 * y;

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

		const currentPlayer = this.raceGame.getCurrentPlayer();
		if (currentPlayer.hasArrived() && this.isReadyToGetPossiblePositions) {
			this.activateAccessiblePositions();
		} else if (
			//If a player gets affected by a banana or any other state change without moving
			currentPlayer.getMaxMovementDistance() !== this.currentPlayerMovement &&
			currentPlayer.hasArrived() &&
			!currentPlayer.getIsAnsweringQuestion()
		) {
			this.currentPlayerMovement = currentPlayer.getMaxMovementDistance();
			this.activateAccessiblePositions();
		}
	}

	update(timestamp: number, elapsed: number) {
		//(i.e time, delta)
		this.lag += elapsed;
		while (this.lag >= this.physTimestep) {
			this.phys(this.physTimestep);
			this.lag -= this.physTimestep;
		}
		this.render();
	}

	private getCharacterSpriteIndex(playerId: string): number {
		return this.characterSprites.findIndex((sprite: CharacterSprites) => sprite.playerId == playerId);
	}

	private transformToCanvasPosition(position: Point): Point {
		return {
			x: this.boardPosition.x + position.x * this.distanceBetweenTwoTiles,
			y: this.boardPosition.y + position.y * this.distanceBetweenTwoTiles,
		};
	}

	useItem(itemType: ItemType, targetPlayerId?: string): void {
		try {
			this.raceGame.itemUsed(itemType, targetPlayerId);
		} catch (e) {
			console.log(e);
		}
	}

	private createQuestionWindow(targetLocation: Point): void {
		var x = Number(this.game.config.width) * 0.05;
		var y = Number(this.game.config.height) * 0.05;

		this.scene.launch(CST.SCENES.QUESTION_WINDOW, {
			targetLocation: targetLocation,
			width: Number(this.game.config.width) * 0.9,
			height: Number(this.game.config.height) * 0.9,
			position: { x: x, y: y },
		});
	}

	answerQuestion(correctAnswer: boolean, position: Point) {
		this.clearTileInteractions();
		if (correctAnswer) {
			this.raceGame.playerMoveRequest(<Point>{ x: position.x, y: position.y });
			// (<Phaser.GameObjects.Sprite>(
			// 	this.tiles.getChildren().find((tile) => tile.getData("gridPosition").x == position.x && tile.getData("gridPosition").y == position.y)
			// )).setTint(this.activeTileColor);  Set a color to targetLocation tile ?
		}
		this.raceGame.getCurrentPlayer().setIsAnsweringQuestion(false);

		this.isReadyToGetPossiblePositions = true;
	}

	private handleSocketEvents(socket: SocketIOClient.Socket): void {
		socket.on(CE.PLAYER_LEFT, (data: PlayerLeftEvent) => {
			this.characterSprites.find((sprite) => data.playerId === sprite.playerId).sprite.destroy();
			this.characterSprites = this.characterSprites.filter((sprite) => data.playerId !== sprite.playerId);
		});

		socket.on(CE.GAME_END, (data: GameEndEvent) => {
			console.log(data);
			this.raceGame.gameFinished();
			this.scene.stop(CST.SCENES.RACE_GAME_UI);
			this.scene.stop(CST.SCENES.QUESTION_WINDOW);
			this.scene.start(CST.SCENES.WAITING_ROOM, { socket: this.raceGame.getCurrentPlayerSocket() });
		});
	}

	private activateAccessiblePositions(): void {
		console.log(this.raceGame.getCurrentPlayer());
		const possiblePositions = this.raceGame.getPossiblePlayerMovement();

		this.clearTileInteractions();

		possiblePositions.forEach((pos: PossiblePositions) => {
			const tile = this.tiles
				.getChildren()
				.find((tile) => tile.getData("gridPosition").x === pos.position.x && tile.getData("gridPosition").y === pos.position.y);
			tile.setState(this.tileActiveState);
			(<Phaser.GameObjects.Sprite>tile).setTint(this.activeTileColor);
		});

		console.log(this.raceGame.getCurrentPlayer());
		console.log(`activated 1 ? Ready: ${this.isReadyToGetPossiblePositions}`);
		this.isReadyToGetPossiblePositions = false;
		console.log(`activated 2 ? Ready: ${this.isReadyToGetPossiblePositions}`);
	}

	private clearTileInteractions(): void {
		this.tiles.getChildren().forEach((tile) => {
			(<Phaser.GameObjects.Sprite>tile).clearTint();
			(<Phaser.GameObjects.Sprite>tile).setState(this.tileInactiveState);
		});
	}
}

interface CharacterSprites {
	playerId: string;
	sprite: Phaser.GameObjects.Sprite;
}
