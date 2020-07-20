import GameInMemoryRepository from "../data/GameInMemoryRepository";
import RoomInMemoryRepository from "../data/RoomsInMemoryRepository";
import ServiceLocator from "./ServiceLocator";

export const applyCommonContext = (): void => {
	ServiceLocator.register(serviceConstants.GAME_REPOSITORY_CLASS, new GameInMemoryRepository());
	ServiceLocator.register(serviceConstants.ROOM_REPOSITORY_CLASS, new RoomInMemoryRepository());
};

export const serviceConstants = {
	GAME_REPOSITORY_CLASS: "GameRepository",
	ROOM_REPOSITORY_CLASS: "RoomRepository",
};

export default applyCommonContext;
