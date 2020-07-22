class RoomNotFoundError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = "RoomNotFoundError";
	}
}
