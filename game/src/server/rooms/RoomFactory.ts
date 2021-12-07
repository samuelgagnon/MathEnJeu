import PreGameFactory from "../../gameCore/gameState/StateFactory";
import { serviceConstants } from "../context/CommonContext";
import ServiceLocator from "../context/ServiceLocator";
import Room from "./Room";

export default class RoomFactory {
	public static create(nsp: SocketIO.Namespace, isPrivate: boolean, maxPlayerCount: number, createTime: number, usedRoomId: string[]): Room {
		const roomId: string = this.generateRoomId(new Set(usedRoomId));
		const roomString = `room-${roomId}`;
		return new Room(
			roomId,
			isPrivate,
			maxPlayerCount,
			createTime,
			PreGameFactory.createPreGame(),
			ServiceLocator.resolve(serviceConstants.GAME_REPOSITORY_CLASS),
			ServiceLocator.resolve(serviceConstants.STATISTICS_REPOSITORY_CLASS),
			roomString,
			nsp
		);
	}

	private static generateRoomId(usedRoomId: Set<string>): string {
		const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
		let randomId = "";
		let count = 0;
		const maxCount = 10;
		do {
			count += 1;
			for (let i = 0; i < 6; i++) {
				randomId += characters.charAt(Math.floor(Math.random() * characters.length));
			}
		} while (usedRoomId.has(randomId) && count < maxCount);

		return randomId;
	}
}
