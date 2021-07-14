//Events the server controller is subscribed to
export const SERVER_EVENT_NAMES = {
	MOVE_REQUEST: "move-request",
	ANSWER_QUESTION: "answer-question",
	USE_ITEM: "use-item",
	USE_BOOK: "use-book", //we may have to rethink how items are used for this specific case
};

//Events the client controller is subscribed to
export const CLIENT_EVENT_NAMES = {
	GAME_CREATED: "game-created",
	GAME_INITIALIZED: "game-initialized",
	GAME_END: "game-end",
	GAME_UPDATE: "game-update",
	PLAYER_LEFT: "player-left",
	QUESTION_FOUND: "question-found",
	QUESTION_FOUND_WITH_BOOK: "question-found-with-book",
	QUESTION_ANSWERED: "question-answered",
	LAP_COMPLETED: "lap-completed",
	ITEM_USED: "item-used",
};
