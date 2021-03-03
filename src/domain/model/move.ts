import { Type } from "@/domain/model/type";

type MoveType = "physical" | "special" | "helping";

export type Move = {
  name: string;
  type: Type;
  power: number;
  pp: number;
  moveType: MoveType;
  contact: boolean;
};
