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
  moves: Move[];
  ability: string;
  effortValue: Statistics;
  individualValue: Statistics;
  characteristic: Characteristic;
  basicValue: Statistics;
  status: Status;
  condition: Condition;
  pp: number[];
  dying: boolean;
};
