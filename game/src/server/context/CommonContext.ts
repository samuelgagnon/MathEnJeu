import GameInMemoryRepository from "../data/GameInMemoryRepository";
import QuestionDbRepository from "../data/QuestionDbRepository";
import RoomInMemoryRepository from "../data/RoomsInMemoryRepository";
import ServiceLocator from "./ServiceLocator";

export const applyCommonContext = (): void => {
	ServiceLocator.register(serviceConstants.GAME_REPOSITORY_CLASS, new GameInMemoryRepository());
	ServiceLocator.register(serviceConstants.ROOM_REPOSITORY_CLASS, new RoomInMemoryRepository());
	ServiceLocator.register(serviceConstants.QUESTION_REPOSITORY_CLASS, new QuestionDbRepository());
};

export const serviceConstants = {
	GAME_REPOSITORY_CLASS: "GameRepository",
	ROOM_REPOSITORY_CLASS: "RoomRepository",
	QUESTION_REPOSITORY_CLASS: "QuestionRepository",
};

export default applyCommonContext;
