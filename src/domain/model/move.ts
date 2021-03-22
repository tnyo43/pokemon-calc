import { Type } from "@/domain/model/type";
import { Status } from "@/domain/model/stats";
import { Ailment } from "@/domain/model/ailment";

type AttackMoveType = "physical" | "special";
export type MoveType = AttackMoveType | "helping";

export type AttackMove = {
  name: string;
  type: Type;
  power: number;
  pp: number;
  accuracy: number;
  moveType: AttackMoveType;
  contact?: boolean;
  priority?: number;
};

export type BuffStatus = Status & { hpRate: number };

export type HelpingMove = {
  name: string;
  type: Type;
  pp: number;
  accuracy: number;
  moveType: "helping";
  priority?: number;
  statusDiff?: {
    own?: Partial<BuffStatus>;
    opponent?: Partial<BuffStatus>;
  };
  protect?: boolean;
  ailment?: Ailment["label"];
};

export type Move = AttackMove | HelpingMove;
