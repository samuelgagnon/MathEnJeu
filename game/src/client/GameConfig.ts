import IsoPlugin from "phaser3-plugin-isometric";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import LoadScene from "./scenes/LoadScene";
import MainScene from "./scenes/MainScene";
import MenuScene from "./scenes/MenuScene";
import QuestionScene from "./scenes/QuestionScene";
import RaceGameUI from "./scenes/RaceGameUI";
import RaceScene from "./scenes/RaceScene";
import RoomSelection from "./scenes/RoomSelectionScene";
import UsersSettingScene from "./scenes/UsersSettingScene";
import WaitingRoomScene from "./scenes/WaitingRoomScene";

const DEFAULT_WIDTH = 1600;
const DEFAULT_HEIGHT = 900;

const gameConfig: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	backgroundColor: "#FFFFFF",
	scale: {
		parent: "phaser-game",
		mode: Phaser.Scale.NONE,
		width: DEFAULT_WIDTH,
		height: DEFAULT_HEIGHT,
	},
	scene: [LoadScene, MenuScene, MainScene, RoomSelection, WaitingRoomScene, RaceScene, RaceGameUI, QuestionScene, UsersSettingScene],
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
	dom: {
		createContainer: true,
	},
};
export default gameConfig;
