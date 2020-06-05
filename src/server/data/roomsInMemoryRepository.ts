import Room from "./room";
import RoomRepository from "./roomRepository";

export default class RoomInMemoryRepository implements RoomRepository {
	private rooms: Map<string, Room> = new Map<string, Room>();

	constructor() {}

	public addRoom(room: Room): void {
		this.rooms.set(room.roomId, room);
	}

	public getRoomById(roomId: string): Room {
		return this.rooms.get(roomId);
	}

	public getAllRooms(): Room[] {
		return Array.from(this.rooms.values());
	}

	public deleteRoomById(roomdId: string): void {
		this.rooms.delete(roomdId);
	}
}
