import Room from "./room";

export default interface RoomRepository {
	addRoom(room: Room): void;
	getRoomById(roomId: string): Room;
	getAllRooms(): Room[];
	deleteRoomById(roomdId: string): void;
}
