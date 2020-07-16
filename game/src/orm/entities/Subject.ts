import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("subject", { schema: "mathamaze2" })
export class Subject {
  @PrimaryGeneratedColumn({ type: "int", name: "subject_id" })
  subjectId: number;
}
