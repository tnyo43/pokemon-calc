import { Pokemon } from "@/domain/model/pokemon";
import { pokemon } from "@/domain/controller/pokemon";
import { statistics } from "@/domain/controller/stats";
import * as Pokedex from "__tests__/mock/pokedexInfo";
import * as Moves from "__tests__/mock/moves";

export const fushigibana: Pokemon = pokemon(
  Pokedex.fushigibana,
  50,
  [Moves.seedBomb],
  0,
  statistics(4, 0, 0, 252, 0, 252),
  statistics(31, 31, 31, 31, 31, 31),
  { up: "specialAttack", down: "attack" }
);

export const rizadon: Pokemon = pokemon(
  Pokedex.rizadon,
  50,
  [Moves.flamethrower, Moves.flareBlitz, Moves.dragonClaw],
  0,
  statistics(0, 0, 0, 0, 0, 0),
  statistics(31, 31, 31, 31, 31, 31),
  null
);

export const kamex: Pokemon = pokemon(
  Pokedex.kamex,
  50,
  [Moves.surf, Moves.dragonPulse],
  0,
  statistics(0, 0, 0, 0, 0, 0),
  statistics(31, 31, 31, 31, 31, 31),
  null
);

export const pikachu: Pokemon = pokemon(
  Pokedex.pikachu,
  50,
  [Moves.Thunderbolt, Moves.voltTackle, Moves.quickAttack],
  0,
  statistics(4, 252, 0, 0, 0, 252),
  statistics(31, 31, 31, 31, 31, 31),
  { up: "speed", down: "specialAttack" }
);

export const solrock: Pokemon = pokemon(
  Pokedex.solrock,
  50,
  [Moves.ancientPower, Moves.confusion],
  0,
  statistics(4, 252, 0, 0, 0, 252),
  statistics(31, 31, 31, 31, 31, 31),
  { up: "speed", down: "specialAttack" }
);
