import { CST } from "../../CST";

export default class InGameMenuScene extends Phaser.Scene {
	backgroundImage: string;
	background: Phaser.GameObjects.TileSprite;

	constructor() {
		const sceneConfig = {
			key: CST.SCENES.BACKGROUD,
		};
		super(sceneConfig);
	}

	init(data: BackgroundSceneData) {
		this.backgroundImage = data.backgroundImage;
	}

	create() {
		this.background = this.add
			.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), this.backgroundImage)
			.setDisplayOrigin(0)
			.setScrollFactor(0)
			.setDepth(-1);
	}
}

export interface BackgroundSceneData {
	backgroundImage: string;
}
