import io from "socket.io-client";
import ClientRaceGameController from "../ClientRaceGame";
import { CST } from "../CST";

export default class LoopTestScene extends Phaser.Scene {
	//Loops
	lag: number;
	physTimestep: number;
	//Sockets
	socket: SocketIOClient.Socket;
	//Visual
	starSprites: { playerId: string; sprite: Phaser.GameObjects.Sprite }[];
	//GameCore
	raceGame: ClientRaceGameController;
	//Buffer
	serverState: {
		playerId: string;
		startTimestamp: number;
		startLocation: { x: number; y: number };
		targetLocation: { x: number; y: number };
	}[];

	constructor() {
		const sceneConfig = { key: CST.SCENES.LOOPTEST };
		super(sceneConfig);
	}

	init() {
		this.raceGame = new ClientRaceGameController();
		this.lag = 0;
		this.physTimestep = 15; //physics checks every 15ms (~66 times/sec - framerate is generally 60 fps)
		this.starSprites = [];
		this.serverState = [];
		this.initializeSocket();
	}

	create() {
		let starfield = this.add.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD).setOrigin(0);

		this.input.on(
			"pointerdown",
			(pointer) => {
				let now: number = Date.now();

				//Tell the Server
				this.socket.emit("moveStarTo", { targetLocation: { x: pointer.x, y: pointer.y }, startTimestamp: now });
				//Client Prediction
				this.loopTestGame.moveStarTo(this.socket.id, { x: pointer.x, y: pointer.y }, now);
			},
			this
		);
	}

	phys(currentframe: number) {
		//Server update
		if (this.serverState.length > 0) {
			this.loopTestGame.setGameState(this.serverState);
			this.serverState = [];
		}

		//Prediction
		this.loopTestGame.update();
	}

	render() {
		this.loopTestGame.getStarsLocation().forEach((starLocation) => {
			let starSpriteIndex: number = this.getStarSpriteIndex(starLocation.playerId);

			//If StarSprite does exist.
			if (starSpriteIndex != -1) {
				this.starSprites[starSpriteIndex].sprite.x = starLocation.position.x;
				this.starSprites[starSpriteIndex].sprite.y = starLocation.position.y;
			} else {
				let newStar: Phaser.GameObjects.Sprite = this.add.sprite(starLocation.position.x, starLocation.position.y, CST.IMAGES.STAR);
				this.starSprites.push({ playerId: starLocation.playerId, sprite: newStar });
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

	//Socket initialization is temporarly here for loop tests.
	initializeSocket() {
		this.socket = io();
		this.socket.on("connect", () => {
			this.loopTestGame.addPlayer(this.socket.id);
		});
		this.socket.on("clientUpdate", (serverState) => {
			this.serverState = serverState;
			//console.log(serverState);
		});
	}

	private getStarSpriteIndex(playerId: string) {
		return this.starSprites.findIndex((starSprite) => starSprite.playerId == playerId);
	}
}
