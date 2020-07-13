import RaceGameState from "../../Communication/Race/raceGameState";
import ClientRaceGameController from "../../GameCore/Race/clientRaceGameController";
import { ItemType } from "../../GameCore/Race/items/item";
import Move from "../../GameCore/Race/move";
import Player from "../../GameCore/Race/player/player";
import { CST } from "../CST";

export default class RaceScene extends Phaser.Scene {
	//Loops
	lag: number;
	physTimestep: number;
	//Sockets
	socket: SocketIOClient.Socket;
	//GameCore
	raceGame: ClientRaceGameController;
	//Buffer
	gameState: RaceGameState;

	characterSprites: CharacterSprites[];
	tiles: Phaser.GameObjects.Group;
	items: Phaser.GameObjects.Group;
	playerStatusText: Phaser.GameObjects.Text;
	playerStatusTime: Phaser.GameObjects.Text;

	//playerItems
	bananaText: Phaser.GameObjects.Text;
	bananaCount: Phaser.GameObjects.Text;
	brainiacText: Phaser.GameObjects.Text;
	brainiacCount: Phaser.GameObjects.Text;
	bookText: Phaser.GameObjects.Text;
	bookCount: Phaser.GameObjects.Text;
	crystalBallText: Phaser.GameObjects.Text;
	crystalBallCount: Phaser.GameObjects.Text;

	constructor() {
		const sceneConfig = { key: CST.SCENES.RACEGAME };
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
		this.gameState = { players: [], itemsState: [] };
	}

	create() {
		let starfield = this.add.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD).setOrigin(0);

		const currentPlayer = this.raceGame.getCurrentPlayer();
		const playerItemState = currentPlayer.getInventory().getInventoryState();

		this.playerStatusText = this.add.text(50, 100, currentPlayer.getCurrentStatus().toString(), {
			fontFamily: "Courier",
			fontSize: "32px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.playerStatusTime = this.add.text(
			this.playerStatusText.getTopRight().x - 60,
			this.playerStatusText.getTopRight().y,
			currentPlayer.getStatusRemainingTime(),
			{
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			}
		);

		this.bananaText = this.add.text(50, 150, "Banana count:", {
			fontFamily: "Courier",
			fontSize: "32px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.bananaCount = this.add.text(this.bananaText.getTopRight().x + 10, this.bananaText.getTopRight().y, playerItemState.bananaCount.toString(), {
			fontFamily: "Courier",
			fontSize: "32px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.bookText = this.add.text(50, 200, "Book count:", {
			fontFamily: "Courier",
			fontSize: "32px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.bookCount = this.add.text(this.bookText.getTopRight().x + 10, this.bookText.getTopRight().y, playerItemState.bookCount.toString(), {
			fontFamily: "Courier",
			fontSize: "32px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.crystalBallText = this.add.text(50, 250, "Crystal ball count:", {
			fontFamily: "Courier",
			fontSize: "32px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.crystalBallCount = this.add.text(
			this.crystalBallText.getTopRight().x + 10,
			this.crystalBallText.getTopRight().y,
			playerItemState.crystalBallCount.toString(),
			{
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#FDFFB5",
				fontStyle: "bold",
			}
		);

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
					tileSprite.setTint(0x86bfda);
				});
				tileSprite.on("pointerout", () => {
					tileSprite.clearTint();
				});
				tileSprite.on("pointerdown", () => {
					tileSprite.setTint(0xff0000);
				});
				tileSprite.on("pointerup", () => {
					tileSprite.clearTint();

					//TODO verify if has arrived logic should be moved to player
					if (this.raceGame.getCurrentPlayer().getMove().getHasArrived()) {
						this.raceGame.playerMoveRequest(<Point>{ x: x, y: y });
					}
				});
			}
		}
	}

	phys(currentframe: number) {
		this.raceGame.update();
	}

	render() {
		this.raceGame.getPlayers().forEach((player: Player) => {
			let characterSpriteIndex: number = this.getCharacterSpriteIndex(player.id);
			const playerMoveState = player.getMove().getMoveState();
			const phaserStartPosition = this.getGamePositionFromLogicPosition({ x: playerMoveState.startLocation.x, y: playerMoveState.startLocation.y });
			const phaserTargetPosition = this.getGamePositionFromLogicPosition({
				x: playerMoveState.targetLocation.x,
				y: playerMoveState.targetLocation.y,
			});
			const phaserStartTimestamp = playerMoveState.startTimestamp;
			if (characterSpriteIndex != -1) {
				this.characterSprites[characterSpriteIndex].move.updateFromMoveState({
					startTimestamp: phaserStartTimestamp,
					startLocation: phaserStartPosition,
					targetLocation: phaserTargetPosition,
				});
				const currentPosition = this.characterSprites[characterSpriteIndex].move.getCurrentPosition();
				this.characterSprites[characterSpriteIndex].sprite.x = currentPosition.x;
				this.characterSprites[characterSpriteIndex].sprite.y = currentPosition.y;
			} else {
				const phaserMove = new Move(phaserStartTimestamp, phaserStartPosition, phaserTargetPosition, 90);
				let newCharacterSprite: Phaser.GameObjects.Sprite = this.add
					.sprite(phaserMove.getCurrentPosition().x, phaserMove.getCurrentPosition().y, CST.IMAGES.STAR)
					.setScale(0.08, 0.08);
				this.characterSprites.push({ playerId: player.id, move: phaserMove, sprite: newCharacterSprite });
			}
		});

		this.items.destroy(true);
		this.items = this.add.group();
		const gameGrid = this.raceGame.getGrid();
		let totalItems = 0;
		for (let y = 0; y < gameGrid.getHeight(); y++) {
			for (let x = 0; x < gameGrid.getWidth(); x++) {
				const currentTile = gameGrid.getTile({ x, y });
				const positionX = <number>this.game.config.width / 2.3 + 96 * x;
				const positionY = <number>this.game.config.height / 7 + 96 * y;

				let itemSprite: any;

				const currentItem = currentTile.getItem();

				if (currentItem) {
					totalItems += 1;
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
		const currentPlayerStatus = currentPlayer.getCurrentStatus().toString();

		//setting player time status
		this.playerStatusText.text = currentPlayerStatus.toString().substring(0, currentPlayerStatus.length - 6);
		this.playerStatusTime.text = currentPlayer.getStatusRemainingTime();

		//setting player item count
		const playerItemState = currentPlayer.getInventory().getInventoryState();
		this.bananaCount.text = playerItemState.bananaCount.toString();
		this.bookCount.text = playerItemState.bookCount.toString();
		this.crystalBallCount.text = playerItemState.crystalBallCount.toString();
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

	private getGamePositionFromLogicPosition(position: Point): Point {
		return this.tiles
			.getChildren()
			.find((tile) => tile.getData("gridPosition").x == position.x && tile.getData("gridPosition").y == position.y)
			.getData("position");
	}
}

interface CharacterSprites {
	playerId: string;
	move: Move;
	sprite: Phaser.GameObjects.Sprite;
}
