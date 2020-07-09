import RaceGameState from "../../Communication/Race/raceGameState";
import ClientRaceGameController from "../../GameCore/Race/clientRaceGameController";
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

	constructor() {
		const sceneConfig = { key: CST.SCENES.RACEGAME };
		super(sceneConfig);
	}

	init(data: any) {
		this.raceGame = data.gameController;
		this.lag = 0;
		this.physTimestep = 15; //physics checks every 15ms (~66 times/sec - framerate is generally 60 fps)
		this.gameState = { players: [], itemsState: [] };
	}

	create() {
		let starfield = this.add.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD).setOrigin(0);
	}

	phys(currentframe: number) {
		//Server update
		if (this.gameState != null) {
			this.raceGame.setGameState(this.gameState);
			this.gameState = null;
		}

		//Prediction
		this.raceGame.update();
	}

	render() {}

	update(timestamp: number, elapsed: number) {
		//(i.e time, delta)
		this.lag += elapsed;
		while (this.lag >= this.physTimestep) {
			this.phys(this.physTimestep);
			this.lag -= this.physTimestep;
		}
		this.render();
	}
}
