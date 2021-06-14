import { Question } from "../../gameCore/race/question/Question";

export default interface QuestionRepository {
	getQuestionsIdByDifficulty(language: string, schoolGradeId: number, difficulty: number): Promise<number[]>;
	getQuestionById(questionId: number, language: string, schoolGradeId?: number): Promise<Question>;
	getAllQuestions(): Promise<any[]>;
	getAllAnswers(): Promise<any[]>;
	getAllTabulars(): Promise<any[]>;
	/**
	 * Set latex for a specific question part
	 * @param questionPart Should be "answer", "feedback" or "question".
	 * @param id Database id
	 * @param lg 1 for FR and 2 for EN
	 * @param latex latex to set
	 * @returns Promise
	 */
	setLatex(questionPart: string, id: number, lg: number, latex: string): Promise<void>;
}
