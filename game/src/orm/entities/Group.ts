import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("group", { schema: "mathamaze2" })
export class Group {
  @PrimaryGeneratedColumn({ type: "int", name: "group_id" })
  groupId: number;
}
