import { Column, Entity, Index } from "typeorm";

@Index("translation_language_id", ["translationLanguageId"], {})
@Entity("language_info", { schema: "mathamaze2" })
export class LanguageInfo {
  @Column("int", { primary: true, name: "language_id" })
  languageId: number;

  @Column("int", { primary: true, name: "translation_language_id" })
  translationLanguageId: number;

  @Column("varchar", { name: "name", length: 16 })
  name: string;
}
