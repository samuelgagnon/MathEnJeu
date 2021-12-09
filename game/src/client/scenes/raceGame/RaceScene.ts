import { Pinch } from "phaser3-rex-plugins/plugins/gestures.js";
import {
	AnswerCorrectedEvent,
	GameEndEvent,
	PlayerLeftEvent,
	QuestionFoundEvent,
	QuestionFoundFromBookEvent,
} from "../../../communication/race/EventInterfaces";
import { CLIENT_EVENT_NAMES as CE } from "../../../communication/race/EventNames";
import { JoinRoomAnswerEvent, JoinRoomRequestEvent } from "../../../communication/room/EventInterfaces";
import { ROOM_EVENT_NAMES } from "../../../communication/room/EventNames";
import AffineTransform from "../../../gameCore/race/AffineTransform";
import ClientRaceGameController from "../../../gameCore/race/ClientRaceGameController";
import { PossiblePositions } from "../../../gameCore/race/grid/RaceGrid";
import { ItemType } from "../../../gameCore/race/items/Item";
import Player from "../../../gameCore/race/player/Player";
import { Answer } from "../../../gameCore/race/question/Answer";
import { Question } from "../../../gameCore/race/question/Question";
import QuestionMapper from "../../../gameCore/race/question/QuestionMapper";
import { CST } from "../../CST";
import { getUserInfo, updateUserHighScore } from "../../services/UserInformationService";
import { LocalizedString } from "./../../Localization";
import { QuestionSceneData } from "./QuestionScene";
import { EventNames, sceneEvents, subscribeToEvent } from "./RaceGameEvents";

const OFFSET_FIRST_TILE = {
	10: { x: 52, y: 52 },
	20: { x: 51, y: 49 },
	30: { x: 47, y: 47 },
};

const OBJECT_LAYER_SCORE = {
	10: 85,
	20: 182,
	30: 387,
};

const DEEP = {
	ACTIVE_TILE: 2,
	ITEM: 3,
	HOVER_ACTIVE_TILE: 4,
	BUILDING: 2105,
};

const WOBBLE_ANIM_DELAY = 100;
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
	readonly distanceBetweenTwoTiles: number = 52;
	camZoom: number = 1;
	boardPosition: Point;
	endingPosition: Point;
	keyboardInputs: Phaser.Types.Input.Keyboard.CursorKeys;
	isFollowingPlayer: boolean = true;
	currentPlayerSprite: Phaser.GameObjects.Sprite;
	pointsForPosition: ActiveTiles[];

	targetLocation: Point;

	currentPlayerMovement: number;
	isReadyToGetPossiblePositions: boolean; //Needed to make sure the scene doesn't always recalculate the possible position
	walkablePositions: PossiblePositions[];
	isThrowingBanana: boolean;
	currentMovingPlayerId: string;
	currentHoveredTile: Phaser.Tilemaps.Tile;

	wobbleAnimDelay: number = 0;
	previousWobble: number = 0;
	lastActionTime: number = 0;
	helmetData = [0, 4, 8, 12, 16, 20, 24, 30, 36, 40, 44, 48, 53, 57, 61, 65, 69, 74, 78, 83, 87, 91, 95, 100, 104, 108, 112, 116];

	readonly tileActiveState: number = 1;
	readonly tileInactiveState: number = 0;
	readonly activeTileColor: number = 0xadff2f;

	readonly maxZoom: number = 1.8;
	readonly minZoom: number = 0.8;
	readonly cameraOffset: number = 4000;

	characterSprites: CharacterSprites[];
	tiles: Phaser.GameObjects.Group;
	items: Phaser.GameObjects.Group;
	randomSprite: Phaser.GameObjects.Group;
	fixe_SolXY;
	fixe_Sol_Layer: Phaser.Tilemaps.TilemapLayer;
	random: Phaser.Tilemaps.TilemapLayer;
	wall_layer: Phaser.Tilemaps.TilemapLayer;
	derriere: Phaser.Tilemaps.TilemapLayer;
	map: Phaser.Tilemaps.Tilemap;
	mapOffset: Point;
	clockObject: Phaser.GameObjects.Sprite;
	balloonObject: Phaser.GameObjects.Sprite;
	houseObject: Phaser.GameObjects.Sprite;
	buildingObject: Phaser.GameObjects.Sprite;
	objectScore: number = 0;
	isQuestionWindow: boolean = false;
	hoverSound: Phaser.Sound.BaseSound;
	setmusicOn: boolean = true;
	setSoundOn: boolean = true;
	ClickTuile_05: Phaser.Sound.BaseSound;
	backMusic: Phaser.Sound.BaseSound;
	correctSound: Phaser.Sound.BaseSound;
	victorySound: Phaser.Sound.BaseSound;
	wrongSound: Phaser.Sound.BaseSound;
	greyMaskImg: Phaser.GameObjects.Image;
	// isFirstTime: boolean;
	//Error
	triedToReconnectAfterSocketError: boolean;

	constructor() {
		super({ key: CST.SCENES.RACE_GAME });
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
		document.body.style.backgroundImage = 'url("static/client/assets/images/gameBack.png")';

		this.setmusicOn = true;
		this.sound.add(CST.SOUND.TransitionInterfaces_04).play();
		this.backMusic = this.sound.add(CST.SOUND.Musique_Base, { loop: true, volume: 0.8 });
		if (this.setmusicOn) {
			this.backMusic.play();
		}
		this.sound.pauseOnBlur = false;
		this.hoverSound = this.sound.add(CST.SOUND.HOVER_SOUND, { loop: false, volume: 0.5 });
		this.ClickTuile_05 = this.sound.add(CST.SOUND.ClickTuile_05);
		this.correctSound = this.sound.add(CST.SOUND.Succes_12);
		this.victorySound = this.sound.add(CST.SOUND.victory_sound);
		this.wrongSound = this.sound.add(CST.SOUND.Erreur_11);
		document.body.style.backgroundImage = 'url("static/client/assets/images/New_Background.png")';

		// this.scene.launch(CST.SCENES.BACKGROUD, <BackgroundSceneData>{ backgroundImage: CST.IMAGES.BACKGROUND1 });
		this.draggableCameraControls();

		this.keyboardInputs = this.input.keyboard.createCursorKeys();

		this.tiles = this.add.group();
		this.items = this.add.group();
		this.randomSprite = this.add.group();
		const currentPlayer = this.raceGame.getCurrentPlayer();
		this.walkablePositions = this.raceGame.getPossibleCurrentPlayerMovement(currentPlayer.getPosition());

		const gameGrid = this.raceGame.getGrid();
		if (this.raceGame.getGameDuration() / 60000 > 20) {
			this.boardPosition = { x: <number>448, y: <number>2432 + 8 };
		} else if (this.raceGame.getGameDuration() / 60000 > 10 && this.raceGame.getGameDuration() / 60000 <= 20) {
			this.boardPosition = { x: <number>320, y: <number>2272 + 8 };
		} else {
			this.boardPosition = { x: <number>64, y: <number>2080 };
		}
		this.isReadyToGetPossiblePositions = true;
		this.scene.launch(CST.SCENES.RACE_GAME_UI);
		//RenderBackground behind everything else
		// this.scene.sendToBack(CST.SCENES.BACKGROUD);

		this.map = this.make.tilemap({ key: "map" });
		var tileset = this.map.addTilesetImage("Assets_Decor_V01", "Spritesheet_V");
		var tileset1 = this.map.addTilesetImage("Assets_Decor_Riviere_V01", "Spritesheet_V1");

		if (this.raceGame.getGameDuration() / 60000 > 20) {
			this.mapOffset = OFFSET_FIRST_TILE[30];
			this.targetLocation = OFFSET_FIRST_TILE[30];
			this.objectScore = OBJECT_LAYER_SCORE[30];
			this.add.image(120, 2125, "Falaise_30min").setScale(1.095);
			this.fixe_Sol_Layer = this.map.createLayer("30min_120cases/Sol", tileset);
			this.random = this.map.createLayer("30min_120cases/random", tileset);
			this.setRandomSprite();
			this.derriere = this.map.createLayer("30min_120cases/Derriere_000", tileset1);
			var Texture_00 = this.map.createLayer("30min_120cases/Texture_00", tileset);
			var Ombre_00 = this.map.createLayer("30min_120cases/Ombre_00", tileset);
			var layer0 = this.map.createLayer("30min_120cases/Etage0", tileset);
			var layer1 = this.map.createLayer("30min_120cases/Etage1", tileset);
			var layer2 = this.map.createLayer("30min_120cases/Etage2", tileset);
			var layer3 = this.map.createLayer("30min_120cases/Etage3", tileset);
			this.wall_layer = this.map.createLayer("30min_120cases/Wall_Layer", tileset);
			var Dessus01 = this.map.createLayer("30min_120cases/Dessus01 (Motifs)", tileset);
			var Ombres_Texture_02 = this.map.createLayer("30min_120cases/Ombres_Texture_02", tileset);
			this.clockObject = this.add.sprite(475, 1995, "Assets_Batiments_V01", 3).setScale(0.9).setDepth(1965);
			this.balloonObject = this.add.sprite(-330, 1965, "Assets_Batiments_V01", 15).setScale(0.9).setDepth(1965);
			this.buildingObject = this.add.sprite(180, 1937, "Assets_Batiments_V01", 13).setScale(1).setDepth(1937);
			this.houseObject = this.add.sprite(-380, 2305, "Assets_Batiments_V01", 7).setScale(1).setDepth(2305);
		} else if (this.raceGame.getGameDuration() / 60000 > 10 && this.raceGame.getGameDuration() / 60000 <= 20) {
			this.mapOffset = OFFSET_FIRST_TILE[20];
			this.targetLocation = OFFSET_FIRST_TILE[20];
			this.objectScore = OBJECT_LAYER_SCORE[20];
			// // 20min_80cases
			this.add.image(45, 2150, "Falaise_20min").setScale(1.11);
			this.fixe_Sol_Layer = this.map.createLayer("20min_80cases/Sol", tileset);
			this.random = this.map.createLayer("20min_80cases/random", tileset);
			this.setRandomSprite();
			var texture = this.map.createLayer("20min_80cases/Texture_00", tileset);
			this.derriere = this.map.createLayer("20min_80cases/Derriere_000", tileset1);
			var Quai_Evo = this.map.createLayer("20min_80cases/Quai_Evo 3-4", tileset);
			var Ombre = this.map.createLayer("20min_80cases/Ombre", tileset);
			var Etage0 = this.map.createLayer("20min_80cases/Etage0", tileset);
			var Etage1 = this.map.createLayer("20min_80cases/Etage1", tileset);
			var Etage2 = this.map.createLayer("20min_80cases/Etage2", tileset);
			var Etage3 = this.map.createLayer("20min_80cases/Etage3", tileset);
			var Dessus01 = this.map.createLayer("20min_80cases/Dessus01", tileset);
			this.wall_layer = this.map.createLayer("20min_80cases/Wall_Layer", tileset);
			var Ombres_Texture_02 = this.map.createLayer("20min_80cases/Ombres_Texture_02", tileset);
			this.clockObject = this.add.sprite(385, 1985, "Assets_Batiments_V01", 3).setScale(0.89).setDepth(1985);
			this.balloonObject = this.add.sprite(-630, 2010, "Assets_Batiments_V01", 15).setScale(1).setDepth(2010);
			this.buildingObject = this.add.sprite(170, 1935, "Assets_Batiments_V01", 13).setScale(1).setDepth(1935);
			this.houseObject = this.add.sprite(-70, 2105, "Assets_Batiments_V01", 7).setScale(1).setDepth(2105);
		} else {
			this.mapOffset = OFFSET_FIRST_TILE[10];
			this.targetLocation = OFFSET_FIRST_TILE[10];
			this.objectScore = OBJECT_LAYER_SCORE[10];
			// // 10min_40cases
			this.add.image(17, 2070, "Falaise_10min").setScale(1.115);
			this.fixe_Sol_Layer = this.map.createLayer("10min_40cases/Sol", tileset);
			this.random = this.map.createLayer("10min_40cases/random", tileset);
			this.setRandomSprite();
			this.derriere = this.map.createLayer("10min_40cases/Derriere_000", tileset1);
			var Ombres_00 = this.map.createLayer("10min_40cases/Ombres_00", tileset);
			var layers0 = this.map.createLayer("10min_40cases/Etage0", tileset);
			var Quai_Evo = this.map.createLayer("10min_40cases/Quai_Evo 3-4", tileset);
			var layers1 = this.map.createLayer("10min_40cases/Etage1", tileset);
			var layers2 = this.map.createLayer("10min_40cases/Etage2", tileset);
			var layers3 = this.map.createLayer("10min_40cases/Etage3", tileset);
			var Ombres_Texture_02 = this.map.createLayer("10min_40cases/Ombres_Texture_02", tileset);
			var Dessus01 = this.map.createLayer("10min_40cases/Dessus01", tileset);
			this.wall_layer = this.map.createLayer("10min_40cases/Wall_Layer", tileset);
			var texture = this.map.createLayer("10min_40cases/Texture_00", tileset);
			this.clockObject = this.add.sprite(20, 1885, "Assets_Batiments_V01", 3).setScale(0.8).setDepth(1885);
			this.balloonObject = this.add.sprite(-480, 1850, "Assets_Batiments_V01", 15).setScale(0.8).setDepth(1850);
		}

		this.greyMaskImg = this.add.image(2000, 2000, "Grey_Mask").setAlpha(0).setScale(10000, 10000);

		// this.fixe_Sol_Layer.putTileAt(1, 100, 50);
		const cameraPosition = new Phaser.Cameras.Scene2D.Camera(0, 0, Number(this.game.config.width), Number(this.game.config.height));
		var mapWidth = this.map.layers[0].width;

		this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
			if (this.setSoundOn) {
				this.ClickTuile_05.play();
			}
			const { worldX, worldY } = pointer;
			this.fixe_SolXY = this.map.getTileAtWorldXY(worldX - 32, worldY - 32, false, cameraPosition, this.wall_layer);
			if (this.fixe_SolXY) {
				const points = { x: Math.abs(this.fixe_SolXY.x - this.mapOffset.x), y: Math.abs(this.fixe_SolXY.y - this.mapOffset.y) };
				this.playerRequestMove(<Point>points);
			}
		});

		this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			this.input.off(Phaser.Input.Events.POINTER_UP);
		});
		//Initilalize camera
		this.render();
		// this.cameras.main.setBounds(-1500, 1500, 2800, 1800);
		this.createCameraBounds(this.boardPosition.x, this.boardPosition.y, mapWidth, mapWidth);
		this.handleFollowPlayerToggle(this.isFollowingPlayer);

		subscribeToEvent(EventNames.gameResumed, this.resumeGame, this);
		subscribeToEvent(EventNames.gamePaused, this.pauseGame, this);
		subscribeToEvent(EventNames.quitGame, this.quitGame, this);
		subscribeToEvent(EventNames.followPlayerToggle, this.handleFollowPlayerToggle, this);
		subscribeToEvent(EventNames.throwingBananaToggle, this.handleThrowingBananaToogle, this);
		subscribeToEvent(EventNames.useBook, this.useBook, this);
		subscribeToEvent(EventNames.useCrystalBall, this.useItem, this);
		subscribeToEvent(EventNames.useBanana, this.useItem, this);
		subscribeToEvent(EventNames.answerQuestion, this.answerQuestion, this);
		subscribeToEvent(EventNames.zoomIn, this.zoomIn, this);
		subscribeToEvent(EventNames.zoomOut, this.zoomOut, this);
		subscribeToEvent(EventNames.gameEnds, () => this.scene.stop(), this);
	}

	setWalkableTiles(walkableTiles) {
		const currentPlayerTiles = walkableTiles.find((tiles) => tiles.playerId === this.raceGame.getCurrentPlayer().getId());
		if (currentPlayerTiles) {
			this.walkablePositions = currentPlayerTiles.tiles;
		}
	}

	playerRequestMove(targetLocation: Point) {
		//To keep target location in memory when we get the answer from question scene
		// this.targetLocation = this.getCoreGameToPhaserPositionRendering().apply(targetLocation);
		this.raceGame.playerMoveRequest(targetLocation);
	}

	setRandomSprite() {
		const gameGrid = this.raceGame.getGrid();
		var randomArrayX = [];
		var randomArrayY = [];
		for (let index = 45; index < 110; index++) {
			const rngx = Math.floor(Math.random() * 62) + 49;
			const rngy = Math.floor(Math.random() * 62) + 49;
			randomArrayX.push(rngx);
			randomArrayY.push(rngy);
		}
		var spriteIndex = [8, 9, 10, 34, 35, 48, 49, 52, 64, 65, 80, 81, 82, 90, 91, 115, 116, 125, 171, 172, 173, 185, 188, 203, 239, 240, 241];
		for (let y = 48; y < 110; y++) {
			for (let x = 48; x < 110; x++) {
				const solLayer = this.random.getTileAt(x, y);

				if (solLayer && solLayer.index == 280) {
					const random = Math.floor(Math.random() * 27);
					if (randomArrayX.includes(solLayer.x) && randomArrayY.includes(solLayer.y)) {
						const { pixelX, pixelY } = solLayer;
						this.randomSprite.create(pixelX + 32, pixelY + 16, "randomSprite", spriteIndex[random]).setScale(0.7);
						this.randomSprite.setDepth(10);
					}
				}
			}
		}
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
		const currentPlayerPoints = this.raceGame.getCurrentPlayer().getPoints();
		const pointsRatio = (100 * currentPlayerPoints) / this.objectScore;
		var clock = 0,
			balloon = 14,
			house = 4,
			building = 10;
		if (pointsRatio < 25) {
		} else if (pointsRatio >= 25 && pointsRatio < 50) {
			clock = 1;
			balloon = 14;
			house = 5;
			building = 11;
		} else if (pointsRatio >= 50 && pointsRatio < 75) {
			clock = 2;
			balloon = 15;
			house = 6;
			building = 12;
		} else {
			clock = 3;
			balloon = 15;
			house = 7;
			building = 12;
		}

		this.clockObject.setTexture("Assets_Batiments_V01", clock);
		this.balloonObject.setTexture("Assets_Batiments_V01", balloon);
		if (this.raceGame.getGameDuration() / 60000 > 10) {
			this.houseObject.setTexture("Assets_Batiments_V01", house);
			this.buildingObject.setTexture("Assets_Batiments_V01", building);
		}
	}

	render() {
		this.renderPlayerSprites();
		this.renderGameBoard();
		this.renderAccessiblePositions();
	}

	private renderPlayerSprites() {
		this.wobbleAnimDelay += 1;
		if (this.isThrowingBanana) {
			this.greyMaskImg.setAlpha(1).setDepth(10000);
		} else {
			this.greyMaskImg.setAlpha(0).setDepth(0);
		}

		this.raceGame.getPlayers().forEach((player: Player) => {
			let characterSpriteIndex: number = this.getCharacterSpriteIndex(player.id);
			const playerMove = player.getMove();
			const startBoardTile = this.fixe_Sol_Layer.getTileAt(
				Math.floor(playerMove.getStartLocation().x) + this.mapOffset.x + 1,
				Math.floor(playerMove.getStartLocation().y) + this.mapOffset.y
			);

			const targetBoardTile = this.fixe_Sol_Layer.getTileAt(
				Math.floor(playerMove.getTargetLocation().x) + this.mapOffset.x + 1,
				Math.floor(playerMove.getTargetLocation().y) + this.mapOffset.y
			);
			let currentPosition;
			currentPosition = player
				.getMove()
				.getCurrentRenderedPosition(
					new AffineTransform(
						this.distanceBetweenTwoTiles / 1000,
						targetBoardTile ? targetBoardTile.pixelX : startBoardTile.pixelX,
						targetBoardTile ? targetBoardTile.pixelY : startBoardTile.pixelY,
						this.distanceBetweenTwoTiles / 1000,
						startBoardTile.pixelX,
						startBoardTile.pixelY
					)
				);
			if (characterSpriteIndex != -1) {
				const characterSprite = this.characterSprites[characterSpriteIndex];
				if (startBoardTile.pixelX > targetBoardTile?.pixelX && startBoardTile.pixelY < targetBoardTile?.pixelY) {
					characterSprite.sprite.anims.play("downcharacter");
					characterSprite.selectedHelmet.anims.play(`downHat-${player.id}`);
				}
				if (startBoardTile.pixelX < targetBoardTile?.pixelX && startBoardTile.pixelY > targetBoardTile?.pixelY) {
					characterSprite.sprite.anims.play("upcharacter");
					characterSprite.selectedHelmet.anims.play(`upHat-${player.id}`);
				}
				if (startBoardTile.pixelX > targetBoardTile?.pixelX && startBoardTile.pixelY > targetBoardTile?.pixelY) {
					characterSprite.sprite.anims.play("leftcharacter");
					characterSprite.selectedHelmet.anims.play(`leftHat-${player.id}`);
				}
				if (startBoardTile.pixelX < targetBoardTile?.pixelX && startBoardTile.pixelY < targetBoardTile?.pixelY) {
					characterSprite.sprite.anims.play("rightcharacter");
					characterSprite.selectedHelmet.anims.play(`rightHat-${player.id}`);
				}

				const angle = ((2 * Math.PI) / 140) * this.wobbleAnimDelay;
				// const wobble = characterSprite.sprite.x === currentPosition.x ? currentPosition.y - 8 + Math.cos(angle) * 5 : currentPosition.y;
				const wobble = currentPosition.y - 8 + Math.cos(angle) * 5;
				var yPosition = wobble;
				// var yPosition = player.id === this.raceGame.getCurrentPlayer().id || player.id.includes("bot") ? wobble : currentPosition.y;
				characterSprite.sprite.x = currentPosition.x;
				characterSprite.sprite.y = yPosition;
				characterSprite.sprite.setDepth(yPosition);
				characterSprite.bottom.x = currentPosition.x;
				characterSprite.bottom.y = yPosition;
				characterSprite.bottom.setDepth(yPosition - 1);
				characterSprite.shadow.x = currentPosition.x;
				characterSprite.shadow.y = currentPosition.y - 4;
				characterSprite.shadow.setDepth(yPosition - 1);
				characterSprite.selectedHelmet.x = currentPosition.x;
				characterSprite.selectedHelmet.y = yPosition - 45;
				characterSprite.selectedHelmet.setDepth(yPosition);

				if (this.isThrowingBanana && player.id !== this.raceGame.getCurrentPlayer().id) {
					characterSprite.sprite.setDepth(10001);
					characterSprite.bottom.setDepth(10001);
					characterSprite.sprite.setInteractive({ useHandCursor: true }).setDepth(10001);
					characterSprite.selectedHelmet.setDepth(10002);
				} else {
					characterSprite.sprite.disableInteractive();
				}

				if (player.id.includes("bot")) {
					characterSprite.sprite.tint = 0x65666b;
					// characterSprite.sprite.setDepth(4);
				} else {
					// characterSprite.sprite.setDepth(5);
				}
			} else {
				console.log("players: ", player, player.getHelmetIndex());
				let newCharactershadow: Phaser.GameObjects.Sprite = this.add.sprite(currentPosition.x, currentPosition.y - 4, "character", 12);
				let newBottomSprite: Phaser.GameObjects.Sprite = this.add.sprite(currentPosition.x, currentPosition.y, "character", 3);
				let newCharacterSprite = this.add.sprite(currentPosition.x, currentPosition.y, "character");
				let selectedHelmet = this.add.sprite(currentPosition.x, currentPosition.y - 45, "Helmet", this.helmetData[player.getHelmetIndex()]);
				const hatIndex = this.helmetData[player.getHelmetIndex()];
				this.anims.create({
					key: `downHat-${player.id}`,
					frames: this.anims.generateFrameNumbers("Helmet", {
						start: hatIndex,
						end: hatIndex,
					}),
					frameRate: 10,
					repeat: -1,
				});

				this.anims.create({
					key: `rightHat-${player.id}`,
					frames: this.anims.generateFrameNumbers("Helmet", { start: hatIndex + 1, end: hatIndex + 1 }),
					frameRate: 10,
					repeat: -1,
				});

				this.anims.create({
					key: `upHat-${player.id}`,
					frames: this.anims.generateFrameNumbers("Helmet", { start: hatIndex + 2, end: hatIndex + 2 }),
					frameRate: 10,
					repeat: -1,
				});

				this.anims.create({
					key: `leftHat-${player.id}`,
					frames: this.anims.generateFrameNumbers("Helmet", { start: hatIndex + 3, end: hatIndex + 3 }),
					frameRate: 10,
					repeat: -1,
				});

				this.anims.create({
					key: "bottomSprite",
					frames: this.anims.generateFrameNumbers("character", { start: 3, end: 10 }),
					frameRate: 20,
					repeat: -1,
				});

				newBottomSprite.anims.play("bottomSprite");

				this.anims.create({
					key: "downcharacter",
					frames: this.anims.generateFrameNumbers("character", { start: 0, end: 0 }),
					frameRate: 10,
					repeat: -1,
				});

				this.anims.create({
					key: "rightcharacter",
					frames: this.anims.generateFrameNumbers("character", { start: 1, end: 1 }),
					frameRate: 10,
					repeat: -1,
				});

				this.anims.create({
					key: "upcharacter",
					frames: this.anims.generateFrameNumbers("character", { start: 2, end: 2 }),
					frameRate: 10,
					repeat: -1,
				});

				this.anims.create({
					key: "leftcharacter",
					frames: this.anims.generateFrameNumbers("character", { start: 11, end: 11 }),
					frameRate: 10,
					repeat: -1,
				});

				if (player.id === this.raceGame.getCurrentPlayer().id) this.currentPlayerSprite = newCharacterSprite;
				this.characterSprites?.push({
					playerId: player.id,
					sprite: newCharacterSprite,
					bottom: newBottomSprite,
					shadow: newCharactershadow,
					selectedHelmet,
				});

				newCharacterSprite.setInteractive({ useHandCursor: true });
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

				let itemSprite: any;

				const currentItem = currentTile.getItem();
				const currentBoardTile = this.fixe_Sol_Layer.getTileAt(x + this.mapOffset.x + 2, y + this.mapOffset.y + 1);

				if (currentItem && currentBoardTile) {
					const { pixelX, pixelY } = currentBoardTile;
					let itemType: ItemType;

					switch (currentItem.type) {
						case ItemType.CrystalBall:
							itemSprite = this.items
								.create(pixelX, pixelY - 10, "Items", 0)
								.setScale(0.9, 0.9)
								.setDepth(pixelY - 19);
							itemType = ItemType.CrystalBall;
							break;
						case ItemType.Brainiac:
							itemSprite = this.items
								.create(pixelX, pixelY - 10, "Items", 1)
								.setScale(0.9, 0.9)
								.setDepth(pixelY - 19);
							itemType = ItemType.Brainiac;
							break;
						case ItemType.Banana:
							itemSprite = this.items
								.create(pixelX, pixelY - 10, "Items", 3)
								.setScale(0.9, 0.9)
								.setDepth(pixelY - 19);
							itemType = ItemType.Banana;
							break;
						case ItemType.Book:
							itemSprite = this.items
								.create(pixelX, pixelY - 10, "Items", 4)
								.setScale(0.9, 0.9)
								.setDepth(pixelY - 19);
							itemType = ItemType.Book;
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

			if (!currentPlayer.isAnsweringQuestion() && currentPlayer.hasArrived()) {
				this.activateAccessiblePositions();
			}
		}
	}

	private getCharacterSpriteIndex(playerId: string): number {
		return this.characterSprites?.findIndex((sprite: CharacterSprites) => sprite.playerId == playerId);
	}

	//The affine transformation needed to render positions might change if there's a resolution change during the game
	//Ex.: Someone playing on mobile changes the mobile orientation from "Portrait" to "Landscape".
	private getCoreGameToPhaserPositionRendering(): AffineTransform {
		return new AffineTransform(this.distanceBetweenTwoTiles, 0, 0, this.distanceBetweenTwoTiles, this.boardPosition.x, this.boardPosition.y);
	}

	useItem(itemType: ItemType, targetPlayerId?: string): void {
		// Enabled item use
		try {
			this.raceGame.itemUsed(itemType, targetPlayerId);
		} catch (e) {
			sceneEvents.emit(EventNames.error, e);
			console.log(e);
			throw e;
		}
	}

	private createQuestionWindow(targetLocation: Point, question: Question): void {
		this.isQuestionWindow = true;
		const questionWindowData: QuestionSceneData = {
			question: question,
			targetLocation: targetLocation,
		};

		this.scene.launch(CST.SCENES.QUESTION_WINDOW, questionWindowData);
	}

	closeWindow() {
		this.isQuestionWindow = false;
	}

	answerQuestion(answer: Answer, position: Point) {
		this.raceGame.clientPlayerAnswersQuestion(answer, position);
		this.targetLocation = position;
		this.currentMovingPlayerId = this.raceGame.getCurrentPlayer().id;
	}

	questionCorrected(isAnswerRight: boolean, correctionTimestamp: number, playerId: string): void {
		if (isAnswerRight == true) {
			if (this.setSoundOn) {
				this.correctSound.play();
			}
		} else {
			if (this.setSoundOn) {
				this.wrongSound.play();
			}
		}
		this.raceGame.playerAnsweredQuestion(
			isAnswerRight,
			this.targetLocation,
			playerId ? playerId : this.raceGame.getCurrentPlayer().id,
			correctionTimestamp
		);
		this.clearTileInteractions();
		if (!isAnswerRight) {
			this.targetLocation = this.raceGame.getCurrentPlayer().getPosition();
		}
		this.isReadyToGetPossiblePositions = true;
	}

	private handleSocketEvents(socket: SocketIOClient.Socket): void {
		socket.on(CE.PLAYER_LEFT, (data: PlayerLeftEvent) => {
			this.characterSprites?.find((sprite) => data.playerId === sprite.playerId).sprite.destroy();
			this.characterSprites?.find((sprite) => data.playerId === sprite.playerId).bottom.destroy();
			this.characterSprites?.find((sprite) => data.playerId === sprite.playerId).shadow.destroy();
			this.characterSprites?.find((sprite) => data.playerId === sprite.playerId).selectedHelmet.destroy();
			this.characterSprites = this.characterSprites?.filter((sprite) => data.playerId !== sprite.playerId);
		});

		socket.on(CE.LOOP_COMPLETED, () => {
			if (this.setSoundOn) {
				this.victorySound.play();
			}
		});

		socket.on(CE.GAME_END, (data: GameEndEvent) => {
			this.endGame();
			this.scene.start(CST.SCENES.ROOM_CREATION, {
				lastGameData: data,
				socket: this.raceGame.getCurrentPlayerSocket(),
				isinputHde: true,
			});
			setTimeout(() => {
				this.scene.start(CST.SCENES.End_GameUI, {
					lastGameData: data,
					socket: this.raceGame.getCurrentPlayerSocket(),
				});
			}, 1000);
			this.sound.stopAll();
		});

		socket.on(CE.QUESTION_FOUND, (data: QuestionFoundEvent) => {
			const questionFound = QuestionMapper.fromDTO(data.questionDTO);
			this.raceGame.getCurrentPlayer().promptQuestion(questionFound);
			this.createQuestionWindow(data.targetLocation, questionFound);
		});

		socket.on(CE.ANSWER_CORRECTED, (data: AnswerCorrectedEvent) => {
			sceneEvents.emit(EventNames.questionCorrected, data.answerIsRight);
			if (data.answerIsRight && this.fixe_SolXY) {
				const currentPlayerId = this.raceGame.getCurrentPlayer().id;
				this.raceGame.broadCastMoveResult(this.fixe_SolXY.pixelX, this.fixe_SolXY.pixelY, data.correctionTimestamp, currentPlayerId);
			} else {
				this.questionCorrected(false, data.correctionTimestamp, null);
			}
			this.walkablePositions = data.walkableTiles;
		});

		socket.on(CE.BANANA_APPLIED, (data) => {
			if (data && data.walkableTiles) {
				this.walkablePositions = data.walkableTiles;
			}
		});

		socket.on(CE.GAME_UPDATE, (data) => {
			this.setWalkableTiles(data.walkableTiles);
		});

		socket.on(CE.MOVE_RESULT, (data) => {
			const cameraPosition = new Phaser.Cameras.Scene2D.Camera(0, 0, Number(this.game.config.width), Number(this.game.config.height));
			this.fixe_SolXY = this.map.getTileAtWorldXY(data.x, data.y, false, cameraPosition, this.fixe_Sol_Layer);
			this.questionCorrected(true, data.correctionTimestamp, data.playerId);
			this.currentMovingPlayerId = data.playerId;
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
				this.scene.start(CST.SCENES.ROOM_CREATION, { socket: socket });
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
		this.characterSprites?.forEach((sprite) => {
			sprite.bottom.destroy();
			sprite.selectedHelmet.destroy();
			sprite.shadow.destroy();
			sprite.sprite.destroy();
		});
		this.characterSprites = [];
		this.clearTileInteractions();
		this.walkablePositions = [];
		updateUserHighScore(this.raceGame.getCurrentPlayer().getPoints());
		this.raceGame.getCurrentPlayerSocket().close();
		sceneEvents.emit(EventNames.gameEnds);
		this.sound.stopAll();
		// this.raceGame.gameFinished();
	}

	soundOff(is_music_on, type) {
		if (type === "sound") {
			if (is_music_on) {
				this.setSoundOn = true;
			} else {
				this.hoverSound.stop();
				this.ClickTuile_05.stop();
				this.correctSound.stop();
				this.wrongSound.stop();
				this.setSoundOn = false;
			}
		} else {
			if (is_music_on) {
				if (!this.backMusic.isPlaying) {
					this.backMusic.play();
					this.setmusicOn = true;
				}
			} else {
				this.backMusic.stop();
				this.setmusicOn = false;
			}
		}
	}

	private activateAccessiblePositions(): void {
		const currentPlayer = this.raceGame.getCurrentPlayer();
		const possiblePositions = this.walkablePositions;
		this.clearTileInteractions();
		possiblePositions &&
			possiblePositions.forEach((pos: PossiblePositions) => {
				var x = Math.floor(pos.position.x) + this.mapOffset.x + 1,
					y = Math.floor(pos.position.y) + this.mapOffset.y;
				const startBoardTile = this.fixe_Sol_Layer.getTileAt(x, y);
				const targetBoardTile = this.fixe_Sol_Layer.getTileAt(x, y);
				var currentPosition;
				if (startBoardTile && targetBoardTile) {
					currentPosition = currentPlayer
						.getMove()
						.getCurrentRenderedPosition(
							new AffineTransform(
								this.distanceBetweenTwoTiles / 1000,
								targetBoardTile ? targetBoardTile.pixelX : startBoardTile.pixelX,
								targetBoardTile ? targetBoardTile.pixelY : startBoardTile.pixelY,
								this.distanceBetweenTwoTiles / 1000,
								startBoardTile.pixelX,
								startBoardTile.pixelY
							)
						);

					let pointsSprite = this.add
						.sprite(currentPosition.x, currentPosition.y + 16, "TilesHover", 7)
						.setScale(1.01)
						.setDepth(DEEP.ACTIVE_TILE);

					var pointsGet = currentPlayer.pointsCalculator(pos.distance).toString();

					var numbers =
						pointsGet == "3" ? 4 : pointsGet == "8" ? 6 : pointsGet == "13" ? 0 : pointsGet == "21" ? 1 : pointsGet == "34" ? 3 : Number(pointsGet);
					let pointsShowTile = this.add
						.sprite(currentPosition.x, currentPosition.y + 16, "TilesHover", 8)
						.setScale(1.01)
						.setDepth(DEEP.HOVER_ACTIVE_TILE)
						.setVisible(false)
						.setInteractive({ useHandCursor: true });

					let pointsShow = this.add
						.sprite(currentPosition.x, currentPosition.y + 16, "TilesHover", numbers)
						.setScale(1.01)
						.setDepth(DEEP.HOVER_ACTIVE_TILE)
						.setVisible(false)
						.setInteractive({ useHandCursor: true });

					if (this.currentHoveredTile && x === this.currentHoveredTile.x && y === this.currentHoveredTile.y) {
						pointsShow.setVisible(true);
						pointsShowTile.setVisible(true);

						if (!this.hoverSound.isPlaying && this.setSoundOn) {
							this.hoverSound.play();
						}
					}

					this.pointsForPosition.push({ image: pointsSprite, points: pointsShow, pointsShowTile, currentPosition: { x: x - 1, y } });
				}
			});
		this.isReadyToGetPossiblePositions = false;
	}

	private clearTileInteractions(): void {
		this.pointsForPosition.forEach((item) => {
			item.image.destroy();
			item.points.destroy();
			item.pointsShowTile.destroy();
		});
		this.pointsForPosition = [];
	}

	public quitGame(): void {
		this.characterSprites?.forEach((sprite) => {
			sprite.bottom.destroy();
			sprite.selectedHelmet.destroy();
			sprite.shadow.destroy();
			sprite.sprite.destroy();
		});
		this.characterSprites = [];
		this.clearTileInteractions();
		this.walkablePositions = [];
		this.raceGame.getCurrentPlayerSocket().close();
		sceneEvents.emit(EventNames.gameEnds);
		this.scene.start(CST.SCENES.USERS_SETTING);
		this.sound.stopAll();
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
			const currentPlayer = this.characterSprites?.find((cSprite) => cSprite.playerId === this.raceGame.getCurrentPlayer().id);
			this.cameras.main.startFollow(currentPlayer.shadow, false, 0.09, 0.09);
		} else {
			this.cameras.main.stopFollow();
		}
	}

	private handleThrowingBananaToogle() {
		this.isThrowingBanana = !this.isThrowingBanana;
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
			this.currentHoveredTile = this.fixe_Sol_Layer.getTileAtWorldXY(p.worldX, p.worldY - 16);

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
			} else if (this.keyboardInputs.up.isDown) {
				this.cameras.main.scrollY -= 4;
			} else if (this.keyboardInputs.down.isDown) {
				this.cameras.main.scrollY += 4;
			} else {
			}
		}
		// if (this.keyboardInputs.left.isDown) {
		// 	this.handleFollowPlayerToggle(false);
		// 	this.cameras.main.scrollX -= 4;
		// } else if (this.keyboardInputs.right.isDown) {
		// 	this.handleFollowPlayerToggle(false);
		// 	this.cameras.main.scrollX += 4;
		// } else if (this.keyboardInputs.up.isDown) {
		// 	this.handleFollowPlayerToggle(false);
		// 	this.cameras.main.scrollY -= 4;
		// } else if (this.keyboardInputs.down.isDown) {
		// 	this.handleFollowPlayerToggle(false);
		// 	this.cameras.main.scrollY += 4;
		// } else {
		// 	this.handleFollowPlayerToggle(true);
		// }
	}

	private zoomIn(): void {
		const cam = this.cameras.main;
		if (cam.zoom < this.maxZoom) {
			cam.zoom += 0.1;
			this.reajustCameraBounds(cam.zoom);
		}
		this.camZoom = cam.zoom;
	}

	private zoomOut(): void {
		const cam = this.cameras.main;
		if (cam.zoom > this.minZoom) {
			cam.zoom -= 0.1;
			this.reajustCameraBounds(cam.zoom);
		}
		this.camZoom = cam.zoom;
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
		var check30 = this.raceGame.getGameDuration() / 60000 > 20,
			check20 = this.raceGame.getGameDuration() / 60000 > 10 && this.raceGame.getGameDuration() / 60000 <= 20;

		var setX = check30 ? 0.339 : check20 ? 0.3 : 0.255,
			setY = check30 ? -0.96 : check20 ? -0.91 : -0.79,
			widthAdd = check30 ? 0.165 : check20 ? 0.15 : 0.122,
			heightAdd = check30 ? 0.0843 : check20 ? 0.0675 : 0.0578;
		this.cameras.main.setBounds(
			(x - this.cameraOffset) * setX,
			(y - this.cameraOffset) * setY,
			((boardWidth - 1) * this.distanceBetweenTwoTiles + 2 * this.cameraOffset) * widthAdd,
			((boardHeight - 1) * this.distanceBetweenTwoTiles + 2 * this.cameraOffset) * heightAdd
		);
	}

	private reajustCameraBounds(zoomFactor: number): void {
		const yOffset = zoomFactor === this.minZoom ? 400 : this.cameraOffset;

		this.cameras.main.setBounds(
			this.boardPosition.x - zoomFactor * this.cameraOffset,
			this.boardPosition.y - zoomFactor * this.cameraOffset,
			(this.raceGame.getGrid().getWidth() - 1) * this.distanceBetweenTwoTiles + 2 * zoomFactor * this.cameraOffset,
			(this.raceGame.getGrid().getHeight() - 1) * this.distanceBetweenTwoTiles + 2 * zoomFactor * this.cameraOffset
		);
	}
}

interface ActiveTiles {
	image: Phaser.GameObjects.Sprite;
	points: Phaser.GameObjects.Sprite;
	pointsShowTile: Phaser.GameObjects.Sprite;
	currentPosition: { x: number; y: number };
}

interface CharacterSprites {
	playerId: string;
	sprite: Phaser.GameObjects.Sprite;
	bottom: Phaser.GameObjects.Sprite;
	shadow: Phaser.GameObjects.Sprite;
	selectedHelmet: Phaser.GameObjects.Sprite;
}
