import IsoPlugin from "phaser3-plugin-isometric";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import LoadScene from "./scenes/loadScene";
import MainScene from "./scenes/mainScene";
import MenuScene from "./scenes/menuScene";
import RoomSelection from "./scenes/roomSelectionScene";
import WaitingRoomScene from "./scenes/waitingRoomScene";

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

const gameConfig: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	backgroundColor: "#FFFFFF",
	scale: {
		parent: "phaser-game",
		mode: Phaser.Scale.NONE,
		width: DEFAULT_WIDTH,
		height: DEFAULT_HEIGHT,
	},
	scene: [LoadScene, MenuScene, MainScene, RoomSelection, WaitingRoomScene],
	plugins: {
		scene: [
			{
				key: "IsoPlugin",
				plugin: IsoPlugin,
				mapping: "iso",
			},
			{
				key: "rexUI",
				plugin: RexUIPlugin,
				mapping: "rexUI",
			},
		],
	},
};
export default gameConfig;
