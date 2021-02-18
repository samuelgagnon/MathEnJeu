import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import BaseSocketScene from "./scenes/BaseSocketScene";
import GameSelection from "./scenes/GameSelectionScene";
import LoadScene from "./scenes/LoadScene";
import MenuScene from "./scenes/MenuScene";
import InGameMenuScene from "./scenes/raceGame/InGameMenuScene";
import QuestionScene from "./scenes/raceGame/QuestionScene";
import RaceGameUI from "./scenes/raceGame/RaceGameUI";
import RaceScene from "./scenes/raceGame/RaceScene";
import ReportErrorScene from "./scenes/raceGame/ReportErrorScene";
import RoomCreation from "./scenes/RoomCreationScene";
import RoomSelection from "./scenes/RoomSelectionScene";
import UsersSettingScene from "./scenes/UsersSettingScene";
import WaitingRoomScene from "./scenes/WaitingRoomScene";

const DEFAULT_WIDTH = 1600;
const DEFAULT_HEIGHT = 900;

const gameConfig: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	backgroundColor: "#FFFFFF",
	width: DEFAULT_WIDTH,
	height: DEFAULT_HEIGHT,
	scene: [
		LoadScene,
		MenuScene,
		GameSelection,
		RoomSelection,
		WaitingRoomScene,
		RaceScene,
		RaceGameUI,
		QuestionScene,
		UsersSettingScene,
		InGameMenuScene,
		ReportErrorScene,
		RoomCreation,
		BaseSocketScene,
	],
	scale: {
		parent: "phaser-game",
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
		],
	},
	dom: {
		createContainer: true, //allows you to use html in scene
	},
};
export default gameConfig;
