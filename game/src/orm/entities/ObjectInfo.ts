import { Column, Entity, Index } from "typeorm";

@Index("language_id", ["languageId"], {})
@Entity("object_info", { schema: "mathamaze2" })
export class ObjectInfo {
  @Column("int", { primary: true, name: "object_id" })
  objectId: number;

  @Column("int", { primary: true, name: "language_id" })
  languageId: number;

  @Column("varchar", { name: "name", length: 64 })
  name: string;

  @Column("varchar", { name: "description", length: 256 })
  description: string;
}
