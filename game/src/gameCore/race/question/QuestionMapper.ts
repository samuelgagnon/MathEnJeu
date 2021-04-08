import { AnswerDTO } from "../../../communication/race/AnswerDTO";
import { QuestionDTO } from "../../../communication/race/QuestionDTO";
import { Answer } from "./Answer";
import { Question } from "./Question";

export default class QuestionMapper {
	public static fromDTO(questionDTO: QuestionDTO): Question {
		return new Question(
			questionDTO.id,
			this.mapAnswersFromDTO(questionDTO.answers),
			questionDTO.answerType,
			questionDTO.schoolGradeId,
			questionDTO.difficulty
		);
	}

	private static mapAnswersFromDTO(answers: AnswerDTO[]): Answer[] {
		return answers.map((answerDTO) => {
			return new Answer(answerDTO.id, answerDTO.label, answerDTO.isRight);
		});
	}

	public static mapAnswer(answerDTO: AnswerDTO): Answer {
		return new Answer(answerDTO.id, answerDTO.label, answerDTO.isRight);
	}
}
