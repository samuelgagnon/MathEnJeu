//Events the server controller is subscribed to
export const SERVER_EVENT_NAMES = {
	MOVE_REQUEST: "move-request",
	QUESTION_ANSWERED: "question-answered",
	ITEM_USED: "item-used",
	BOOK_USED: "book-used", //we may have to rethink how items are used for this specific case
};

//Events the client controller is subscribed to
export const CLIENT_EVENT_NAMES = {
	GAME_START: "game-start",
	GAME_INITIALIZED: "game-initialized",
	GAME_END: "game-end",
	GAME_UPDATE: "game-update",
	PLAYER_LEFT: "player-left",
	QUESTION_FOUND: "question-found",
	QUESTION_FOUND_WITH_BOOK: "question-found-with-book",
	ANSWER_CORRECTED: "answer-corrected",
};

export const WAITING_ROOM_EVENT_NAMES = {
	ROOM_INFO: "room-info",
	SCENE_LOADED: "scene-loaded",
};
