import { getConnection } from "typeorm";
import { Answer as GameAnswer } from "../../gameCore/race/Answer";
import { Question as GameQuestion } from "../../gameCore/race/Question";
import QuestionRepository from "./QuestionRepository";

export default class QuestionDbRepository implements QuestionRepository {
	constructor() {}

	async getQuestionsIdByDifficulty(languageShortName: string, schoolGradeId: number, difficulty: number): Promise<Number[]> {
		const queryString = `SELECT DISTINCT question.question_id as questionId
		FROM question
		INNER JOIN question_info
			  ON question.question_id=question_info.question_id
		INNER JOIN question_level
			  ON question.question_id=question_level.question_id
		WHERE question.answer_type_id IN (1,4)
		AND question_info.is_valid = 1
		AND question_level.level_id = ${schoolGradeId}
		AND question_level.\`value\` = ${difficulty}
		AND question_info.language_id IN
			(SELECT language_id
			FROM \`language\`
			WHERE \`language\`.short_name LIKE '${languageShortName}');`;

		const rows = await getConnection().query(queryString);

		const questionsId: Number[] = rows.map((row) => Number(row.questionId));
		return questionsId;
	}

	async getQuestionById(questionId: number, languageShortName: string, schoolGradeId: number): Promise<GameQuestion> {
		const queryString = `SELECT answer.label as answerString, answer.is_right as answerIsRight, answer_type.tag as answerType,
		question_info.question_flash_file as questionFileName, question_info.feedback_flash_file as feedbackFileName, 
		question_level.value as difficulty
			FROM question
            INNER JOIN answer
			ON question.question_id=answer.question_id
            INNER JOIN question_info
			ON question.question_id=question_info.question_id
            INNER JOIN answer_type
			ON question.question_id=answer_type.answer_type_id
            INNER JOIN question_level
			ON question.question_id=question_level.question_id
			WHERE question_level.level_id = ${schoolGradeId}
			AND question_info.language_id IN
				(SELECT language_id
				FROM \`language\`
				WHERE \`language\`.short_name LIKE '${languageShortName}')
			AND question.question_id = ${questionId} ;`;

		const rows = await getConnection().query(queryString);

		if (rows.length == 0) {
			throw Error(
				`No question matches the following parameters : 
				questionId=${questionId}, 
				languageShortName=${languageShortName}, 
				levelId=${schoolGradeId}`
			);
		}

		const gameAnswers: GameAnswer[] = rows.map((row) => new GameAnswer(row.answerString, row.answerIsRight));
		//The number of row corresponds to the number of possible answers for the question.
		//Information concerning the question can be fetched in any row. Here we take the first one.
		const gameQuestion: GameQuestion = new GameQuestion(
			gameAnswers,
			rows[0].answerType,
			schoolGradeId,
			rows[0].difficulty,
			rows[0].questionFileName,
			rows[0].feedbackFileName
		);

		return gameQuestion;
	}
}
