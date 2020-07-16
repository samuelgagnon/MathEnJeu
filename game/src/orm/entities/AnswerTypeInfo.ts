import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { AnswerType } from "./AnswerType";
import { Language } from "./Language";

@Index("language_id", ["languageId"], {})
@Entity("answer_type_info", { schema: "mathamaze2" })
export class AnswerTypeInfo {
  @Column("int", { primary: true, name: "answer_type_id" })
  answerTypeId: number;

  @Column("int", { primary: true, name: "language_id" })
  languageId: number;

  @Column("varchar", { name: "name", length: 64 })
  name: string;

  @Column("varchar", { name: "description", nullable: true, length: 256 })
  description: string | null;

  @ManyToOne(() => AnswerType, (answerType) => answerType.answerTypeInfos, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([
    { name: "answer_type_id", referencedColumnName: "answerTypeId" },
  ])
  answerType: AnswerType;

  @ManyToOne(() => Language, (language) => language.answerTypeInfos, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "language_id", referencedColumnName: "languageId" }])
  language: Language;
}
