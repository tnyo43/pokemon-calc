import { Characteristic } from "@/domain/model/characteristic";
import { Move } from "@/domain/model/move";
import { Statistics, Status } from "@/domain/model/stats";
import { Type } from "@/domain/model/type";
import { Ability } from "@/domain/model/ability";

export type PokedexInfo = {
  no: number;
  name: string;
  types: Type[];
  baseStats: Statistics;
  abilities: Ability[];
};

export type Pokemon = Omit<PokedexInfo, "abilities"> & {
  level: number;
  moves: Move[];
  ability: Ability;
  effortValue: Statistics;
  individualValue: Statistics;
  characteristic: Characteristic;
  status: Status;
  basicValue: Statistics;
};
