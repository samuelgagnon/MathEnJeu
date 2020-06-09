export default class UndefinedRoomTypeError extends Error {
	constructor(roomType: string) {
		super(`${roomType} room type is undefined`);

		Object.setPrototypeOf(this, UndefinedRoomTypeError.prototype);
	}
}
