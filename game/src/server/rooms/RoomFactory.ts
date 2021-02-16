import { v4 as uuidv4 } from "uuid";
import PreGameFactory from "../../gameCore/gameState/StateFactory";
import { serviceConstants } from "../context/CommonContext";
import ServiceLocator from "../context/ServiceLocator";
import Room from "./Room";

export default class RoomFactory {
	public static create(nsp: SocketIO.Namespace, isPrivate: boolean, password?: number): Room {
		const roomId: string = uuidv4();
		const roomString = `room-${roomId}`;
		return new Room(
			roomId,
			isPrivate,
			PreGameFactory.createPreGame(),
			ServiceLocator.resolve(serviceConstants.GAME_REPOSITORY_CLASS),
			ServiceLocator.resolve(serviceConstants.STATISTICS_REPOSITORY_CLASS),
			roomString,
			nsp,
			password
		);
	}
}
