import { Question } from "../../gameCore/race/Question";

export default interface QuestionRepository {
	getQuestionsIdByDifficulty(language: string, levelId: number, difficulty: number): Promise<Number[]>;
	getQuestionById(questionId: number, language: string, levelId: number): Promise<Question>;
}
