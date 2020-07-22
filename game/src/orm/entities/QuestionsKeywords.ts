import { Column, Entity, Index } from "typeorm";

@Index("FK_questions_keywords_keyword", ["keywordId"], {})
@Entity("questions_keywords", { schema: "mathamaze2" })
export class QuestionsKeywords {
  @Column("int", { primary: true, name: "question_id" })
  questionId: number;

  @Column("int", { primary: true, name: "keyword_id" })
  keywordId: number;
}
