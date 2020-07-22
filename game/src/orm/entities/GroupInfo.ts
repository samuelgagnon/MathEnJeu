import { Column, Entity, Index } from "typeorm";

@Index("language_id", ["languageId"], {})
@Entity("group_info", { schema: "mathamaze2" })
export class GroupInfo {
  @Column("int", { primary: true, name: "group_id" })
  groupId: number;

  @Column("int", { primary: true, name: "language_id" })
  languageId: number;

  @Column("varchar", { name: "name", length: 32 })
  name: string;
}
