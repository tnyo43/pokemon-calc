import { Type } from "@/domain/model/type";
import { Status } from "@/domain/model/stats";

type AttackMoveType = "physical" | "special";
export type MoveType = AttackMoveType | "helping";

export type AttackMove = {
  name: string;
  type: Type;
  power: number;
  pp: number;
  accuracy: number;
  moveType: AttackMoveType;
  contact: boolean;
  proprity?: number;
};

export type BuffStatus = Status & { hpRate: number };

export type HelpingMove = {
  name: string;
  type: Type;
  pp: number;
  accuracy: number;
  moveType: "helping";
  proprity?: number;
  statusDiff?: {
    own?: Partial<BuffStatus>;
    opponent?: Partial<BuffStatus>;
  };
};

export type Move = AttackMove | HelpingMove;
