import { AnswerDTO, QuestionDTO } from "../../../communication/race/DataInterfaces";
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
			const isRight = answerDTO.isRight == 1 ? true : false;
			return new Answer(answerDTO.id, answerDTO.label, isRight);
		});
	}
}
