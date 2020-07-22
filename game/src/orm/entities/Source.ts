import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("source", { schema: "mathamaze2" })
export class Source {
  @PrimaryGeneratedColumn({ type: "int", name: "source_id" })
  sourceId: number;

  @Column("varchar", { name: "name", length: 256 })
  name: string;
}
