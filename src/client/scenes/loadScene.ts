import { CST } from "../CST";

export default class LoadScene extends Phaser.Scene {
	constructor() {
		const sceneConfig = { key: CST.SCENES.LOAD };
		super(sceneConfig);
	}
	loadImages() {
		this.load.setBaseURL("static/client/assets/images");

		for (let prop in CST.IMAGES) {
			this.load.image(CST.IMAGES[prop], CST.IMAGES[prop]);
		}
	}

	preload() {
		//create loading bar

		let loadingBar = this.add.graphics({
			fillStyle: {
				color: 0xffffff, //white
			},
		});

		this.load.on("progress", (percent: number) => {
			loadingBar.fillRect(this.game.renderer.width / 2, 0, 50, this.game.renderer.height * percent);
		});

		this.loadImages();
	}

	create() {
		this.scene.start(CST.SCENES.MENU);
	}
}
