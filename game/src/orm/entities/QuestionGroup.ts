import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("language_id", ["languageId"], {})
@Entity("question_group", { schema: "mathamaze2" })
export class QuestionGroup {
  @PrimaryGeneratedColumn({ type: "int", name: "question_group_id" })
  questionGroupId: number;

  @Column("int", { name: "language_id" })
  languageId: number;

  @Column("varchar", { name: "name", length: 64 })
  name: string;

  @Column("varchar", { name: "description", nullable: true, length: 256 })
  description: string | null;
}
