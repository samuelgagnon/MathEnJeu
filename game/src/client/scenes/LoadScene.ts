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
		this.load.image("Spritesheet_V", "Tilemap/Assets_V01/Assets_Decor_V01.png");
		this.load.image("Spritesheet_V1", "Tilemap/Assets_V01/Assets_Decor_Riviere_V01.png");
		this.load.image("Grey_Mask", "grey-mask.png");
		this.load.spritesheet("TilesHover", "Assets_CasesHover_V01.png", {
			frameWidth: 64,
			frameHeight: 64,
		});
		this.load.spritesheet("character", "Tilemap/Assets_V01/robot.png", {
			frameWidth: 64,
			frameHeight: 96,
		});
		this.load.spritesheet("Items", "Tilemap/Assets_V01/Assets_Items_V02.png", {
			frameWidth: 64,
			frameHeight: 64,
		});
		this.load.spritesheet("Helmet", "Tilemap/Assets_V01/Assets_Chapeaux_V01.png", {
			frameWidth: 64,
			frameHeight: 64,
		});

		this.load.image("Falaise_10min", "Tilemap/Assets_V01/Spritesheet_Background_Autres/Falaise_10min.png");
		this.load.image("Falaise_20min", "Tilemap/Assets_V01/Spritesheet_Background_Autres/Falaise_20min.png");
		this.load.image("Falaise_30min", "Tilemap/Assets_V01/Spritesheet_Background_Autres/Falaise_30min.png");

		this.load.spritesheet("Assets_Batiments_V01", "Tilemap/Assets_V01/Assets_Batiments_V01.png", {
			frameWidth: 256,
			frameHeight: 256,
		});

		this.load.spritesheet("randomSprite", "Tilemap/Assets_V01/Assets_Decor_V01.png", {
			frameWidth: 64,
			frameHeight: 64,
		});
	}

	loadHTML() {
		this.load.setPath("scenes/htmlElements/");
		for (let prop in CST.HTML) {
			this.load.html(CST.HTML[prop], CST.HTML[prop]);
		}
	}

	loadSound() {
		this.load.setPath("assets/sound/");
		for (let prop in CST.SOUND) {
			this.load.audio(CST.SOUND[prop], CST.SOUND[prop]);
		}
	}

	preload() {
		let loadingBar = this.add.graphics({
			fillStyle: {
				color: 0xffffff, //white
			},
		});
		this.load.on("progress", (percent: number) => {
			loadingBar.fillRect(this.game.renderer.width / 2, 0, 50, this.game.renderer.height * percent);
		});

		this.load.setBaseURL("static/client/");
		this.load.tilemapTiledJSON("map", "assets/images/Tilemap/Plateaux_Aout_V01.json");

		this.loadImages();
		this.loadHTML();
		this.loadSound();
		this.load.on("complete", function () {
			const loading = Array.from(document.getElementsByClassName("loading") as HTMLCollectionOf<HTMLElement>);
			loading[0].style.visibility = "hidden";
		});
		this.load.scenePlugin({
			key: "rexuiplugin",
			url: "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js",
			sceneKey: "rexUI",
		});
	}

	create() {
		this.scene.start(CST.SCENES.USERS_SETTING);
	}
}
