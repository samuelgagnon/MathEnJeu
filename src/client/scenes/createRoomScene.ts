import { CST } from "../CST";

export default class CreateRoom extends Phaser.Scene {
	constructor() {
		const sceneConfig = { key: CST.SCENES.CREATE_ROOM };
		super(sceneConfig);
	}

	create() {}
}
