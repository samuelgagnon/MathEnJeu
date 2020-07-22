import { Question } from "../../gameCore/race/Question";

export default interface QuestionRepository {
	getQuestionsIdByDifficulty(language: string, schoolGradeId: number, difficulty: number): Promise<Number[]>;
	getQuestionById(questionId: number, language: string, schoolGradeId: number): Promise<Question>;
}
