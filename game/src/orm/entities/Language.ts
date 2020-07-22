import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AnswerInfo } from "./AnswerInfo";
import { AnswerTypeInfo } from "./AnswerTypeInfo";

@Entity("language", { schema: "mathamaze2" })
export class Language {
  @PrimaryGeneratedColumn({ type: "int", name: "language_id" })
  languageId: number;

  @Column("varchar", { name: "short_name", length: 5 })
  shortName: string;

  @Column("varchar", { name: "url", length: 128 })
  url: string;

  @OneToMany(() => AnswerInfo, (answerInfo) => answerInfo.language)
  answerInfos: AnswerInfo[];

  @OneToMany(() => AnswerTypeInfo, (answerTypeInfo) => answerTypeInfo.language)
  answerTypeInfos: AnswerTypeInfo[];
}
