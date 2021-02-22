export const JOIN_ROOM_ERROR_NAME = {
	FULL: "JoiningFullRoomError",
	NOT_FOUND: "JoiningNonExistentRoomError",
	GAME_IN_PROGRESS: "JoiningGameInProgressRoomError",
};

export class JoiningFullRoomError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = JOIN_ROOM_ERROR_NAME.FULL;
	}
}
export class JoiningNonExistentRoomError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = JOIN_ROOM_ERROR_NAME.NOT_FOUND;
	}
}

export class JoiningGameInProgressRoomError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = JOIN_ROOM_ERROR_NAME.GAME_IN_PROGRESS;
	}
}
