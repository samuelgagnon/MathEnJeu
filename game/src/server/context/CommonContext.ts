import ServiceLocator from "./serviceLocator";
import GameInMemoryRepository from "../data/gameInMemoryRepository";
import RoomInMemoryRepository from "../data/roomsInMemoryRepository";

export const applyCommonContext = (): void => {
	ServiceLocator.register(serviceConstants.GAME_REPOSITORY_CLASS, new GameInMemoryRepository());
	ServiceLocator.register(serviceConstants.ROOM_REPOSITORY_CLASS, new RoomInMemoryRepository());
};

export const serviceConstants = {
	GAME_REPOSITORY_CLASS: "GameRepository",
	ROOM_REPOSITORY_CLASS: "RoomRepository",
};

export default applyCommonContext;
