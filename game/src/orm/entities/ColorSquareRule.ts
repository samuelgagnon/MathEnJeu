import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("FK_room_id", ["roomId"], {})
@Entity("color_square_rule", { schema: "mathamaze2" })
export class ColorSquareRule {
  @PrimaryGeneratedColumn({ type: "int", name: "color_square_rule_id" })
  colorSquareRuleId: number;

  @Column("int", { name: "room_id" })
  roomId: number;

  @Column("int", { name: "type" })
  type: number;

  @Column("int", { name: "priority" })
  priority: number;
}
