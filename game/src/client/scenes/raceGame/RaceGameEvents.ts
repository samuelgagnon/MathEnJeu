import Phaser from "phaser";

export const sceneEvents = new Phaser.Events.EventEmitter();

export const EventNames = {
	quitGame: "quit-game",
	gameResumed: "game-resume",
	gamePaused: "game-pause",
	followPlayerToggle: "follow-player-toggle",
	throwingBananaToggle: "throwing-banana-toggle",
	errorWindowOpened: "error-window-opened",
	errorWindowClosed: "error-window-closed",
	error: "error",
};
