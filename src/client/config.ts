import IsoPlugin from "phaser3-plugin-isometric";
import LoadScene from "./scenes/loadScene";
import MainScene from "./scenes/mainScene";
import MenuScene from "./scenes/menuScene";

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	backgroundColor: "#FFFFFF",
	scale: {
		parent: "phaser-game",
		mode: Phaser.Scale.NONE,
		width: DEFAULT_WIDTH,
		height: DEFAULT_HEIGHT,
	},
	scene: [LoadScene, MenuScene, MainScene],
	plugins: {
		scene: [
			{
				key: "IsoPlugin",
				plugin: IsoPlugin,
				mapping: "iso",
			},
		],
	},
};
export default config;
