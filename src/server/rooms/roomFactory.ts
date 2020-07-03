import { Namespace } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import GameFSM from "../../GameCore/gameState/gameFSM";
import PreGameFactory from "../../GameCore/gameState/stateFactory";
import { serviceConstants } from "../context/commonContext";
import ServiceLocator from "../context/serviceLocator";
import { Room } from "./room";

export default class RoomFactory {
	public static create(nsp: SocketIO.Namespace): Room {
		const roomId: string = uuidv4();
		const roomString = `room-${roomId}`;
		const gameFSM: GameFSM = this.createGameFSM(nsp, roomString);
		return new Room(roomId, nsp, gameFSM, roomString);
	}

	private static createGameFSM(nsp: Namespace, roomString: string): GameFSM {
		const fsmId = uuidv4();
		return new GameFSM(fsmId, PreGameFactory.createPreGame(), ServiceLocator.resolve(serviceConstants.GAME_REPOSITORY_CLASS), roomString, nsp);
	}
}
