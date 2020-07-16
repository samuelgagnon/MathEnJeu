import { Column, Entity, Index } from "typeorm";

@Index("FK_question_group_room_room", ["roomId"], {})
@Entity("question_group_room", { schema: "mathamaze2" })
export class QuestionGroupRoom {
  @Column("int", { primary: true, name: "question_group_id" })
  questionGroupId: number;

  @Column("int", { primary: true, name: "room_id" })
  roomId: number;
}
