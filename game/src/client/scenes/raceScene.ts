import RaceGameState from "../../Communication/Race/raceGameState";
import ClientRaceGameController from "../../GameCore/Race/clientRaceGameController";
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

		this.tiles = this.add.group();

		for (let y = 0; y < this.raceGame.getGrid().getHeight(); y++) {
			for (let x = 0; x < this.raceGame.getGrid().getWidth(); x++) {
				let sprite = this.tiles
					.create(<number>this.game.config.width / 3.2 + 96 * x, <number>this.game.config.height / 7 + 96 * y, CST.IMAGES.ORANGE_SQUARE)
					.setScale(0.3, 0.3);
				// sprite.name = `tile-(${x},${y})`;
				// sprite.position = <Point>{ x: x, y: y };
				sprite.setData("name", `tile-(${x},${y})`);
				sprite.setData("gridPosition", <Point>{ x: x, y: y });
				sprite.setData("position", <Point>{ x: sprite.x, y: sprite.y });

				sprite.setInteractive();
				sprite.on("pointerover", () => {
					sprite.setTint(0x86bfda);
				});
				sprite.on("pointerout", () => {
					sprite.clearTint();
				});
				sprite.on("pointerdown", () => {
					sprite.setTint(0xff0000);
				});
				sprite.on("pointerup", () => {
					sprite.clearTint();
					this.raceGame.playerMoveRequest(<Point>{ x: x, y: y });
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
				const phaserMove = new Move(phaserStartTimestamp, phaserStartPosition, phaserTargetPosition);

				let newCharacterSprite: Phaser.GameObjects.Sprite = this.add
					.sprite(phaserMove.getCurrentPosition().x, phaserMove.getCurrentPosition().y, CST.IMAGES.STAR)
					.setScale(0.08, 0.08);

				this.characterSprites.push({ playerId: player.id, move: phaserMove, sprite: newCharacterSprite });
			}
		});
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
