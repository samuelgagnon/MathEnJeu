import { v4 as uuidv4 } from "uuid";
import { Room } from "./room";

export default class RoomFactory {
	public static create(nsp: SocketIO.Namespace): Room {
		const roomId: string = uuidv4();
		return new Room(roomId, nsp);
	}
}
