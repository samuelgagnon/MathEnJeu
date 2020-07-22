import { Column, Entity, Index } from "typeorm";

@Index("FK_question_group_question_3", ["questionId", "languageId"], {})
@Index("language_id", ["languageId"], {})
@Entity("question_group_question", { schema: "mathamaze2" })
export class QuestionGroupQuestion {
  @Column("int", { primary: true, name: "question_group_id" })
  questionGroupId: number;

  @Column("int", { name: "question_id" })
  questionId: number;

  @Column("int", { name: "language_id" })
  languageId: number;
}
