class RoomFullError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = "RoomFullError";
	}
}
