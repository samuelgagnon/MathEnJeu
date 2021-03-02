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

	zoomIn: "zoom-in",
	zoomOut: "zoom-out",

	errorWindowOpened: "error-window-opened",
	errorWindowClosed: "error-window-closed",
	error: "error",
};

export const subscribeToEvent = (eventName: string, callBack: Function, context: any) => {
	sceneEvents.on(eventName, callBack, context);
	context.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
		sceneEvents.off(eventName, callBack, context);
	});
};
