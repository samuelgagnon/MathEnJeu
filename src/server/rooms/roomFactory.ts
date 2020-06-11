import { v4 as uuidv4 } from "uuid";
import { RaceRoom } from "./raceRoom";
import Room from "./room";
import RoomType from "./roomType";
import { TestRoom } from "./testRoom";
import UndefinedRoomTypeError from "./undefinedRoomTypeError";

export default class RoomFactory {
	public static create(type: RoomType, nsp: SocketIO.Namespace): Room {
		const roomId: string = uuidv4();
		switch (type) {
			case RoomType.RaceRoom:
				return new RaceRoom(roomId, nsp);

			case RoomType.TestRoom:
				return new TestRoom(roomId, nsp);

			default:
				throw new UndefinedRoomTypeError(type);
		}
	}
}
