import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("object", { schema: "mathamaze2" })
export class Object {
  @PrimaryGeneratedColumn({ type: "int", name: "object_id" })
  objectId: number;

  @Column("varchar", { name: "tag", length: 64 })
  tag: string;
}
