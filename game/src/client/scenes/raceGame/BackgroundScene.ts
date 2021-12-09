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
		document.body.style.backgroundImage = 'url("static/client/assets/images/gameBack.png")';
	}
}

export interface BackgroundSceneData {
	backgroundImage: string;
}
