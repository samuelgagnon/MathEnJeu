import { Column, Entity, Index, JoinColumn, OneToMany } from "typeorm";
import { AnswerInfo } from "./AnswerInfo";
import { Question } from "./Question";

@Index("user_id", ["userId"], {})
@Index("language_id", ["languageId"], {})
@Entity("question_info", { schema: "mathamaze2" })
export class QuestionInfo {
	@Column("int", { primary: true, name: "question_id" })
	questionId: number;

	@Column("int", { primary: true, name: "language_id" })
	languageId: number;

	@Column("text", { name: "question_latex", nullable: true })
	questionLatex: string | null;

	@Column("varchar", {
		name: "question_flash_file",
		nullable: true,
		length: 128,
	})
	questionFlashFile: string | null;

	@Column("text", { name: "feedback_latex", nullable: true })
	feedbackLatex: string | null;

	@Column("varchar", {
		name: "feedback_flash_file",
		nullable: true,
		length: 128,
	})
	feedbackFlashFile: string | null;

	@Column("tinyint", { name: "is_valid", width: 1 })
	isValid: boolean;

	@Column("int", { name: "user_id" })
	userId: number;

	@Column("date", { name: "creation_date" })
	creationDate: string;

	@Column("date", { name: "last_modified", nullable: true })
	lastModified: string | null;

	@Column("tinyint", { name: "is_animated", width: 1 })
	isAnimated: boolean;

	@JoinColumn([{ name: "question_id", referencedColumnName: "questionId" }])
	question: Question;

	@OneToMany(() => AnswerInfo, (answerInfo) => answerInfo.questionInfo)
	answerInfos: AnswerInfo[];
}
