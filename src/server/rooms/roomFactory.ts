import { Server as SocketIOServer } from "socket.io";
import { RaceRoom } from "./raceRoom";
import Room from "./room";
import RoomType from "./roomType";

export default class RoomFactory {
	public static create(type: RoomType, roomId: string, socketServer: SocketIOServer): Room {
		switch (type) {
			case RoomType.RaceRoom:
				return new RaceRoom(roomId, socketServer);

			case RoomType.ClassicRoom:
				break;

			case RoomType.QnARoom:
				break;
		}
	}
}
