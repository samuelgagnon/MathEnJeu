import { v4 as uuidv4 } from "uuid";
import { RaceRoom } from "./raceRoom";
import Room from "./room";
import RoomType from "./roomType";

export default class RoomFactory {
	public static create(type: RoomType, nsp: SocketIO.Namespace): Room {
		const roomId: string = uuidv4();
		switch (type) {
			case RoomType.RaceRoom:
				return new RaceRoom(roomId, nsp);

			case RoomType.ClassicRoom:
				break;

			case RoomType.QnARoom:
				break;
		}
	}
}
