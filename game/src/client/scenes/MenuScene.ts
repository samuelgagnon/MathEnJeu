import { CST } from "../CST";

export default class MenuScene extends Phaser.Scene {
	constructor() {
		const sceneConfig = {
			key: CST.SCENES.MENU,
		};
		super(sceneConfig);
	}

	create() {
		this.add.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD).setOrigin(0).setDepth(0);

		this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.2, CST.IMAGES.TITLE).setDepth(1);

		let playButton = this.add
			.image(this.game.renderer.width / 2, this.game.renderer.height / 2, CST.IMAGES.PLAY)
			.setDepth(1)
			.setInteractive({
				useHandCursor: true,
			});

		playButton
			.on("pointerover", () => {
				playButton.setTint(0xffff66);
			})
			.on("pointerout", () => {
				playButton.clearTint();
			})
			.on("pointerdown", () => {
				playButton.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				playButton.clearTint();
				this.scene.start(CST.SCENES.USERS_SETTING);
			});
	}
}
