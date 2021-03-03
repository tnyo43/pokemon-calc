import { Pokemon } from "@/domain/model/pokemon";
import { pokemon } from "@/domain/service/pokemon";
import { statistics } from "@/domain/service/stats";
import * as Pokedex from "__tests__/mock/pokedexInfo";

export const fushigibana: Pokemon = pokemon(
  Pokedex.fushigibana,
  50,
  [],
  0,
  statistics(4, 0, 0, 252, 0, 252),
  statistics(31, 31, 31, 31, 31, 31),
  { up: "specialAttack", down: "attack" }
);

export const rizadon: Pokemon = pokemon(
  Pokedex.rizadon,
  50,
  [],
  0,
  statistics(0, 0, 0, 0, 0, 0),
  statistics(0, 0, 0, 0, 0, 0),
  null
);

export const kamex: Pokemon = pokemon(
  Pokedex.kamex,
  50,
  [],
  0,
  statistics(0, 0, 0, 0, 0, 0),
  statistics(0, 0, 0, 0, 0, 0),
  null
);

export const pikachu: Pokemon = pokemon(
  Pokedex.pikachu,
  50,
  [],
  0,
  statistics(4, 252, 0, 0, 0, 252),
  statistics(31, 31, 31, 31, 31, 31),
  { up: "speed", down: "specialAttack" }
);
