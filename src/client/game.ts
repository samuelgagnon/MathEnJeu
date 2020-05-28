import config from "./config";
import PreloadScene from "./scenes/preloadScene";

export default class Game extends Phaser.Game {
	constructor() {
		super(config);
	}
}
