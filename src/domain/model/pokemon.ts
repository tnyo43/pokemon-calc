import { Characteristic } from "@/domain/model/characteristic";
import { Move } from "@/domain/model/move";
import { Condition, Statistics, Status } from "@/domain/model/stats";
import { Type } from "@/domain/model/type";

export type PokedexInfo = {
  no: number;
  name: string;
  types: Type[];
  baseStats: Statistics;
  abilities: string[];
};

export type Pokemon = Omit<PokedexInfo, "abilities"> & {
  level: number;
  moves: { move: Move; pp: number }[];
  ability: string;
  effortValue: Statistics;
  individualValue: Statistics;
  characteristic: Characteristic;
  status: Status;
  condition: Condition;
  basicValue: Statistics;
  dying: boolean;
};
