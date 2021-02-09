import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import InGameMenuScene from "./scenes/aceGame/InGameMenuScene";
import QuestionScene from "./scenes/aceGame/QuestionScene";
import RaceGameSceneController from "./scenes/aceGame/RaceGameSceneController";
import RaceGameUI from "./scenes/aceGame/RaceGameUI";
import RaceScene from "./scenes/aceGame/RaceScene";
import ReportErrorScene from "./scenes/aceGame/ReportErrorScene";
import LoadScene from "./scenes/LoadScene";
import MenuScene from "./scenes/MenuScene";
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
	scene: [
		LoadScene,
		MenuScene,
		RoomSelection,
		WaitingRoomScene,
		RaceScene,
		RaceGameUI,
		QuestionScene,
		UsersSettingScene,
		InGameMenuScene,
		ReportErrorScene,
		RaceGameSceneController,
	],
	plugins: {
		scene: [
			{
				key: "rexUI",
				plugin: RexUIPlugin,
				mapping: "rexUI",
			},
		],
	},
	dom: {
		createContainer: true, //allows you to use html in scene
	},
};
export default gameConfig;
