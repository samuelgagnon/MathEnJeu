import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Answer } from "./Answer";
import { QuestionInfo } from "./QuestionInfo";
import { Question } from "./Question";
import { Language } from "./Language";

@Index("question_id", ["questionId", "languageId"], {})
@Index("language_id", ["languageId"], {})
@Entity("answer_info", { schema: "mathamaze2" })
export class AnswerInfo {
  @Column("int", { primary: true, name: "answer_id" })
  answerId: number;

  @Column("int", { name: "question_id" })
  questionId: number;

  @Column("int", { primary: true, name: "language_id" })
  languageId: number;

  @Column("text", { name: "answer_latex" })
  answerLatex: string;

  @Column("varchar", { name: "answer_flash_file", nullable: true, length: 128 })
  answerFlashFile: string | null;

  @ManyToOne(() => Answer, (answer) => answer.answerInfos, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "answer_id", referencedColumnName: "answerId" }])
  answer: Answer;

  @ManyToOne(() => QuestionInfo, (questionInfo) => questionInfo.answerInfos, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([
    { name: "question_id", referencedColumnName: "questionId" },
    { name: "language_id", referencedColumnName: "languageId" },
  ])
  questionInfo: QuestionInfo;

  @ManyToOne(() => Question, (question) => question.answerInfos, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "question_id", referencedColumnName: "questionId" }])
  question: Question;

  @ManyToOne(() => Language, (language) => language.answerInfos, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "language_id", referencedColumnName: "languageId" }])
  language: Language;
}
