import { AnswerDTO } from "./AnswerDTO";

export interface QuestionDTO {
	id: number;
	answers: AnswerDTO[];
	answerType: string;
	schoolGradeId: number;
	difficulty: number;
	questionRelativePath: string;
	feedbackRelativePath: string;
}

export interface InfoForQuestion {
	schoolGrade: number;
	language: string;
}
