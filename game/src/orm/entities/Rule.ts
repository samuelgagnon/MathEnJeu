import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("rule", { schema: "mathamaze2" })
export class Rule {
  @PrimaryGeneratedColumn({ type: "int", name: "rule_id" })
  ruleId: number;

  @Column("varchar", { name: "name", length: 64 })
  name: string;

  @Column("varchar", { name: "description", nullable: true, length: 256 })
  description: string | null;

  @Column("int", { name: "chat" })
  chat: number;

  @Column("float", { name: "hole_ratio", precision: 12 })
  holeRatio: number;

  @Column("float", { name: "shop_ratio", precision: 12 })
  shopRatio: number;

  @Column("float", { name: "object_ratio", precision: 12 })
  objectRatio: number;

  @Column("float", { name: "special_square_ratio", precision: 12 })
  specialSquareRatio: number;

  @Column("float", { name: "coin_ratio", precision: 12 })
  coinRatio: number;

  @Column("float", { name: "win_the_game_tick", precision: 12 })
  winTheGameTick: number;

  @Column("int", { name: "max_object_shop", default: () => "'4'" })
  maxObjectShop: number;

  @Column("int", { name: "max_coin_value", default: () => "'25'" })
  maxCoinValue: number;

  @Column("int", { name: "minimal_time", default: () => "'10'" })
  minimalTime: number;

  @Column("int", { name: "maximal_time", default: () => "'60'" })
  maximalTime: number;

  @Column("int", { name: "max_object_coin", default: () => "'10'" })
  maxObjectCoin: number;

  @Column("int", { name: "max_movement", default: () => "'6'" })
  maxMovement: number;

  @Column("tinyint", { name: "money_permit", default: () => "'1'" })
  moneyPermit: number;

  @Column("tinyint", { name: "show_nb_questions", default: () => "'0'" })
  showNbQuestions: number;

  @Column("tinyint", { name: "maxNbPlayers", default: () => "'12'" })
  maxNbPlayers: number;

  @Column("tinyint", { name: "nbTracks", default: () => "'4'" })
  nbTracks: number;

  @Column("tinyint", { name: "nbVirtualPlayers", default: () => "'0'" })
  nbVirtualPlayers: number;
}
