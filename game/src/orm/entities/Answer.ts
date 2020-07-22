import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AnswerInfo } from "./AnswerInfo";
import { Question } from "./Question";

@Index("question_id", ["questionId"], {})
@Entity("answer", { schema: "mathamaze2" })
export class Answer {
	@PrimaryGeneratedColumn({ type: "int", name: "answer_id" })
	answerId: number;

	@Column("int", { name: "question_id" })
	questionId: number;

	@Column("tinyint", { name: "is_right", width: 1 })
	isRight: boolean;

	@Column("varchar", { name: "label", nullable: true, length: 3 })
	label: string | null;

	@ManyToOne(() => Question, (question) => question.answers, {
		onDelete: "CASCADE",
		onUpdate: "CASCADE",
	})
	@JoinColumn([{ name: "question_id", referencedColumnName: "questionId" }])
	question: Question;

	@OneToMany(() => AnswerInfo, (answerInfo) => answerInfo.answer)
	answerInfos: AnswerInfo[];
}
