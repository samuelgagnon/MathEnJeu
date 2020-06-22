import { v4 as uuidv4 } from "uuid";
import GameFSM from "../../GameCore/gameState/gameFSM";
import StateFactory from "../../GameCore/gameState/stateFactory";
import { serviceConstants } from "../context/commonContext";
import ServiceLocator from "../context/serviceLocator";
import { Room } from "./room";

export default class RoomFactory {
	public static create(nsp: SocketIO.Namespace): Room {
		const roomId: string = uuidv4();
		const gameFSM: GameFSM = this.createGameFSM();
		return new Room(roomId, nsp, gameFSM);
	}

	private static createGameFSM(): GameFSM {
		return new GameFSM(StateFactory.createPreGame(), ServiceLocator.resolve(serviceConstants.GAME_REPOSITORY_CLASS));
	}
}
