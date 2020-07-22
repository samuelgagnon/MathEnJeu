import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("title", { schema: "mathamaze2" })
export class Title {
  @PrimaryGeneratedColumn({ type: "int", name: "title_id" })
  titleId: number;

  @Column("varchar", { name: "name", length: 64 })
  name: string;
}
