import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AnswerTypeInfo } from "./AnswerTypeInfo";

@Entity("answer_type", { schema: "mathamaze2" })
export class AnswerType {
  @PrimaryGeneratedColumn({ type: "int", name: "answer_type_id" })
  answerTypeId: number;

  @Column("varchar", { name: "tag", length: 64 })
  tag: string;

  @OneToMany(
    () => AnswerTypeInfo,
    (answerTypeInfo) => answerTypeInfo.answerType
  )
  answerTypeInfos: AnswerTypeInfo[];
}
