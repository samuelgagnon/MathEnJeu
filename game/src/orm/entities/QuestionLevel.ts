import { Column, Entity, Index } from "typeorm";

@Index("FK_QUESTION_LEVEL_LEVEL", ["levelId"], {})
@Entity("question_level", { schema: "mathamaze2" })
export class QuestionLevel {
  @Column("int", { primary: true, name: "question_id" })
  questionId: number;

  @Column("int", { primary: true, name: "level_id" })
  levelId: number;

  @Column("int", { name: "value" })
  value: number;
}
