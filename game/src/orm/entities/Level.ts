import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("language_id", ["languageId"], {})
@Entity("level", { schema: "mathamaze2" })
export class Level {
  @PrimaryGeneratedColumn({ type: "int", name: "level_id" })
  levelId: number;

  @Column("int", { primary: true, name: "language_id" })
  languageId: number;

  @Column("varchar", { name: "name", nullable: true, length: 64 })
  name: string | null;

  @Column("varchar", { name: "name_Canada", nullable: true, length: 256 })
  nameCanada: string | null;
}
