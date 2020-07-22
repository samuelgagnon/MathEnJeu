import { Column, Entity, Index } from "typeorm";

@Index("language_id", ["languageId"], {})
@Entity("keyword_info", { schema: "mathamaze2" })
export class KeywordInfo {
  @Column("int", { primary: true, name: "keyword_id" })
  keywordId: number;

  @Column("int", { primary: true, name: "language_id" })
  languageId: number;

  @Column("varchar", { name: "name", length: 64 })
  name: string;
}
