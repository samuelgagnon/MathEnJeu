import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("question_id", ["questionId"], {})
@Index("language_id", ["languageId"], {})
@Entity("questions_with_error", { schema: "mathamaze2" })
export class QuestionsWithError {
  @PrimaryGeneratedColumn({
    type: "smallint",
    name: "error_id",
    unsigned: true,
  })
  errorId: number;

  @Column("int", { name: "question_id" })
  questionId: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("int", { name: "language_id" })
  languageId: number;

  @Column("varchar", { name: "description", nullable: true, length: 512 })
  description: string | null;
}
