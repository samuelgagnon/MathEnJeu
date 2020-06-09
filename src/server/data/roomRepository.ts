import Room from "../rooms/room";

export default interface RoomRepository {
	addRoom(room: Room): void;
	getRoomById(roomId: string): Room;
	getAllRooms(): Room[];
	deleteRoomById(roomdId: string): void;
}
