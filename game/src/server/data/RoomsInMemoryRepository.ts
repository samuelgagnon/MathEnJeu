import Room from "../rooms/Room";
import RoomRepository from "./RoomRepository";

export default class RoomInMemoryRepository implements RoomRepository {
	private rooms: Map<string, Room> = new Map<string, Room>();

	public addRoom(room: Room): void {
		this.rooms.set(room.getId(), room);
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
