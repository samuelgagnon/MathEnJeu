export default class PreloadScene extends Phaser.Scene {
	constructor() {
		super({ key: "PreloadScene" });
	}

	preload() {
		this.load.setBaseURL("static/client");
		this.load.image("starfield", "assets/starfield.jpg");
		this.load.image("tile", "assets/tileSprites/testTile.png");
	}
	create() {
		this.scene.start("MainScene");
	}
}
