//Events the server controller is subscribed to
export const SERVER_EVENT_NAMES = {
	MOVE_REQUEST: "move-request",
	QUESTION_ANSWERED: "question-answered",
	ITEM_USED: "item-used",
	BOOK_USED: "book-used", //we may have to rethink how items are used for this specific case
	BROADCAST_MOVE_RESULT: "BROADCAST_MOVE_RESULT",
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
	ANSWER_CORRECTED: "answer-corrected",
	MOVE_RESULT: "MOVE_RESULT",
	BANANA_APPLIED: "BANANA_APPLIED",
	LOOP_COMPLETED: "LOOP_COMPLETED",
};
