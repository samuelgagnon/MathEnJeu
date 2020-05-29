export default class MainScene extends Phaser.Scene {
	constructor() {
		const sceneConfig = { key: "MainScene", mapAdd: { isoPlugin: "iso" } };
		super(sceneConfig);
	}

	create() {
		let starfield = this.add
			.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), "starfield")
			.setOrigin(0);

		//@ts-ignore
		this.isoGroup = this.add.group();
		//@ts-ignore
		this.iso.projector.origin.setTo(0.5, 0.3);
		this.spawnTiles();
	}

	spawnTiles() {
		for (var xx = 0; xx < 256; xx += 38) {
			for (var yy = 0; yy < 256; yy += 38) {
				//@ts-ignore
				let tile = this.add.isoSprite(xx, yy, 0, "tile", this.isoGroup);
				tile.setInteractive();

				tile.on("pointerover", () => {
					tile.setTint(0x86bfda);
					tile.isoZ += 5;
				});

				tile.on("pointerout", function () {
					tile.clearTint();
					tile.isoZ -= 5;
				});
			}
		}
	}
}
