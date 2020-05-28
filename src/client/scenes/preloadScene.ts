export default class PreloadScene extends Phaser.Scene {
	constructor() {
		super({ key: "PreloadScene" });
	}

	preload() {
		this.load.setBaseURL("static/client");
		this.load.image("starfield", "assets/starfield.jpg");
	}

	create() {
		let starfield = this.add
			.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), "starfield")
			.setOrigin(0);
	}
}
