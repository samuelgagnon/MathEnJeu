export const ROOM_EVENT_NAMES = {
	CREATE_ROOM: "create-room",
	JOIN_ROOM_REQUEST: "join-room-request",
	JOIN_ROOM_ANSWER: "join-room-answer",
	HOST_CHANGE: "host-change",
	IS_HOST: "is-host",
	CHANGE_ROOM_SETTINGS: "change-room-settings",
};

export const WAITING_ROOM_EVENT_NAMES = {
	//Events the client controller is subscribed to
	CLIENT_EVENT: {
		ROOM_INFO: "room-info",
		GAME_INITIALIZED: "game-initialized",
		GAME_INITIALIZATION_CANCELED: "game-initialization-canceled",
		KICKED: "kicked",
	},
	//Events the server controller is subscribed to
	SERVER_EVENT: {
		INITIALIZE_GAME: "initialize-game",
		CANCEL_GAME_INITIALIZATION: "cancel-game-initialization",
		SCENE_LOADED: "scene-loaded",
		KICK_PLAYER: "kick-player",
		READY: "ready",
	},
};
