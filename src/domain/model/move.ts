import { Type } from "@/domain/model/type";

type MoveType = "physical" | "special" | "helping";

export type Move = {
  name: string;
  type: Type;
  power: number;
  pp: number;
  accuracy: number;
  moveType: MoveType;
  contact: boolean;
};

export type MoveIndex = 0 | 1 | 2 | 3;
