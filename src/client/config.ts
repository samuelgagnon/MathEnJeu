import IsoPlugin from "phaser3-plugin-isometric";
import MainScene from "./scenes/mainScene";
import PreloadScene from "./scenes/preloadScene";

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
	scene: [PreloadScene, MainScene],
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
