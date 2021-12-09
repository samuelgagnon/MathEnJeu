// import { CST } from "../CST";
// import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from "../GameConfig";

// export default class MenuScene extends Phaser.Scene {
// 	constructor() {
// 		const sceneConfig = {
// 			key: CST.SCENES.MENU,
// 		};
// 		super(sceneConfig);
// 	}

// 	create() {
// 		this.scale.setGameSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
// 		document.body.style.backgroundImage = 'url("static/client/assets/images/starfield.png")';
// 		// this.add.image(Number(this.game.config.width) / 2 + 6, Number(this.game.config.height) / 2 + 18, CST.IMAGES.BACKGROUD).setScale(0.71, 0.713);
// 		var graphics = this.add
// 			.graphics()
// 			.fillStyle(0x5e3614, 1)
// 			.fillRoundedRect(window.innerWidth / 2.92, 0, window.innerWidth * 0.3, window.innerHeight * 0.35, { tl: 0, tr: 0, bl: 20, br: 20 });

// 		this.add.image(window.innerWidth / 2, window.innerHeight / 1.5, CST.IMAGES.OPTIONS_BACK).setScale(0.85);

// 		let playButton = this.add
// 			.image(this.game.renderer.width / 2, this.game.renderer.height / 2, CST.IMAGES.PLAY)
// 			.setDepth(1)
// 			.setInteractive({
// 				useHandCursor: true,
// 			});

// 		playButton
// 			.on("pointerover", () => {
// 				playButton.setTint(0xffff66);
// 			})
// 			.on("pointerout", () => {
// 				playButton.clearTint();
// 			})
// 			.on("pointerdown", () => {
// 				playButton.setTint(0x86bfda);
// 			})
// 			.on("pointerup", () => {
// 				playButton.clearTint();
// 				this.scene.start(CST.SCENES.USERS_SETTING);
// 			});
// 	}
// }
