import GameInMemoryRepository from "../data/GameInMemoryRepository";
import QuestionDbRepository from "../data/QuestionDbRepository";
import ReportedErrorDbRepository from "../data/ReportedErrorDbRepository";
import RoomInMemoryRepository from "../data/RoomsInMemoryRepository";
import StatisticsDbRepository from "../data/StatisticsDbRepository";
import ServiceLocator from "./ServiceLocator";

export const applyCommonContext = (): void => {
	ServiceLocator.register(serviceConstants.GAME_REPOSITORY_CLASS, new GameInMemoryRepository());
	ServiceLocator.register(serviceConstants.ROOM_REPOSITORY_CLASS, new RoomInMemoryRepository());
	ServiceLocator.register(serviceConstants.QUESTION_REPOSITORY_CLASS, new QuestionDbRepository());
	ServiceLocator.register(serviceConstants.REPORTED_ERROR_REPOSITORY_CLASS, new ReportedErrorDbRepository());
	ServiceLocator.register(serviceConstants.STATISTICS_REPOSITORY_CLASS, new StatisticsDbRepository());
};

export const serviceConstants = {
	GAME_REPOSITORY_CLASS: "GameRepository",
	ROOM_REPOSITORY_CLASS: "RoomRepository",
	REPORTED_ERROR_REPOSITORY_CLASS: "ReportedErrorRepository",
	QUESTION_REPOSITORY_CLASS: "QuestionRepository",
	STATISTICS_REPOSITORY_CLASS: "StatisticsRepository",
};

export default applyCommonContext;
