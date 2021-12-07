import GesturesPlugin from "phaser3-rex-plugins/plugins/gestures-plugin.js";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import BaseScene from "./scenes/BaseScene";
// import GameSelection from "./scenes/GameSelectionScene";
import LoadScene from "./scenes/LoadScene";
// import MenuScene from "./scenes/MenuScene";
import BackgroundScene from "./scenes/raceGame/BackgroundScene";
import InGameMenuScene from "./scenes/raceGame/InGameMenuScene";
import QuestionScene from "./scenes/raceGame/QuestionScene";
import RaceGameUI from "./scenes/raceGame/RaceGameUI";
import RaceScene from "./scenes/raceGame/RaceScene";
import ReportErrorScene from "./scenes/raceGame/ReportErrorScene";
import RoomCreation from "./scenes/RoomCreationScene";
import RoomSelection from "./scenes/RoomSelectionScene";
import UsersSettingScene from "./scenes/UsersSettingScene";
import WaitingRoomScene from "./scenes/WaitingRoomScene";
import EndGameUIScene from "./scenes/raceGame/EndgameScene";
const DEFAULT_WIDTH = 1366;
const DEFAULT_HEIGHT = 768;
const gameConfig: Phaser.Types.Core.GameConfig = {
	type: Phaser.WEBGL,
	transparent: true,
	backgroundColor: "transparent",
	width: DEFAULT_WIDTH,
	height: DEFAULT_HEIGHT,
	scene: [
		LoadScene,
		// MenuScene,
		// GameSelection,
		RoomSelection,
		WaitingRoomScene,
		RaceScene,
		RaceGameUI,
		QuestionScene,
		UsersSettingScene,
		InGameMenuScene,
		ReportErrorScene,
		RoomCreation,
		BaseScene,
		BackgroundScene,
		EndGameUIScene,
	],
	scale: {
		parent: "phaser-game",
		// mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.Center.CENTER_BOTH,
	},
	plugins: {
		scene: [
			{
				key: "rexUI",
				plugin: RexUIPlugin,
				mapping: "rexUI",
			},
			{
				key: "rexGestures",
				plugin: GesturesPlugin,
				mapping: "rexGestures",
			},
		],
	},
	dom: {
		createContainer: true, //allows you to use html in scene
	},
};
export default gameConfig;
export { DEFAULT_WIDTH, DEFAULT_HEIGHT };
