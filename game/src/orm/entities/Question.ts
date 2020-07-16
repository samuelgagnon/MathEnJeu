import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Answer } from "./Answer";
import { AnswerInfo } from "./AnswerInfo";

@Index("answer_type_id", ["answerTypeId"], {})
@Index("source_id", ["sourceId"], {})
@Index("title_id", ["titleId"], {})
@Entity("question", { schema: "mathamaze2" })
export class Question {
  @PrimaryGeneratedColumn({ type: "int", name: "question_id" })
  questionId: number;

  @Column("int", { name: "answer_type_id" })
  answerTypeId: number;

  @Column("int", { name: "source_id" })
  sourceId: number;

  @Column("int", { name: "title_id" })
  titleId: number;

  @Column("varchar", { name: "label", nullable: true, length: 16 })
  label: string | null;

  @Column("int", { name: "creator_id" })
  creatorId: number;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];

  @OneToMany(() => AnswerInfo, (answerInfo) => answerInfo.question)
  answerInfos: AnswerInfo[];
}
