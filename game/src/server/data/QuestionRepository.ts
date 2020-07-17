import { Question } from "../../GameCore/Race/Question";

export default interface QuestionRepository {
	getQuestionsForPlayer(playerLevel, difficulty): Promise<Question[]>;
	getQuestionById(questionId: number): Promise<Question>;
}
