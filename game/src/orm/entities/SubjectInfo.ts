import { Column, Entity, Index } from "typeorm";

@Index("language_id", ["languageId"], {})
@Entity("subject_info", { schema: "mathamaze2" })
export class SubjectInfo {
  @Column("int", { primary: true, name: "subject_id" })
  subjectId: number;

  @Column("int", { primary: true, name: "language_id" })
  languageId: number;

  @Column("varchar", { name: "name", length: 64 })
  name: string;

  @Column("varchar", { name: "description", nullable: true, length: 256 })
  description: string | null;
}
