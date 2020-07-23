import { CST } from "../CST";

export default class LoadScene extends Phaser.Scene {
	constructor() {
		const sceneConfig = { key: CST.SCENES.LOAD };
		super(sceneConfig);
	}
	loadImages() {
		this.load.setPath("assets/images/");

		for (let prop in CST.IMAGES) {
			this.load.image(CST.IMAGES[prop], CST.IMAGES[prop]);
		}
	}

	loadHTML() {
		this.load.setPath("scenes/htmlElements/");

		for (let prop in CST.HTML) {
			this.load.html(CST.HTML[prop], CST.HTML[prop]);
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

		this.load.setBaseURL("static/client/");

		this.loadImages();
		this.loadHTML();
	}

	create() {
		this.scene.start(CST.SCENES.MENU);
	}
}
