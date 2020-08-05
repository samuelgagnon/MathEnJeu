//Events the server controller is subscribed to
export const SERVER_EVENT_NAMES = {
	MOVE_REQUEST: "move-request",
	QUESTION_ANSWERED: "question-answered",
	ITEM_USED: "item-used",
};

//Events the client controller is subscribed to
export const CLIENT_EVENT_NAMES = {
	GAME_START: "game-start",
	GAME_END: "game-end",
	GAME_UPDATE: "game-update",
	PLAYER_LEFT: "player-left",
	QUESTION_FOUND: "question-found",
};
