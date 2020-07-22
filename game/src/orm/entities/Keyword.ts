import { Column, Entity, Index } from "typeorm";

@Index("group_id", ["groupId"], {})
@Entity("keyword", { schema: "mathamaze2" })
export class Keyword {
  @Column("int", { primary: true, name: "keyword_id" })
  keywordId: number;

  @Column("int", { name: "group_id" })
  groupId: number;
}
