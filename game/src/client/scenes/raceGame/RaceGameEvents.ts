import Phaser from "phaser";

export const sceneEvents = new Phaser.Events.EventEmitter();

export const EventNames = {
	answerQuestion: "answer-question",
	questionCorrected: "question-corrected",
	useBook: "use-book",
	useCrystalBall: "use-crystal-ball",
	newQuestionFound: "new-question-found",

	gamePaused: "game-pause",
	gameResumed: "game-resume",
	quitGame: "quit-game",

	followPlayerToggle: "follow-player-toggle",
	throwingBananaToggle: "throwing-banana-toggle",

	errorWindowOpened: "error-window-opened",
	errorWindowClosed: "error-window-closed",
	error: "error",
};
