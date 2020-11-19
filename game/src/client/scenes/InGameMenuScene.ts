import { CST } from "../CST";

export default class InGameMenuScene extends Phaser.Scene {
	constructor() {
		const sceneConfig = {
			key: CST.SCENES.IN_GAME_MENU,
		};
		super(sceneConfig);
	}

	create() {}
}
