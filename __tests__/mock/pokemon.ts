import { Pokemon } from "@/domain/model/pokemon";
import { pokemon } from "@/domain/controller/pokemon";
import { statistics } from "@/domain/controller/stats";
import * as Pokedex from "__tests__/mock/pokedexInfo";
import * as Moves from "__tests__/mock/moves";
import { Environment } from "@/domain/model/environment";
import { damage as damageSub } from "@/domain/controller/pokemon";

export const damage = (
  index: number,
  attacker: Pokemon,
  defencer: Pokemon,
  env?: Environment
) => {
  const move = attacker.moves[index];
  return move.moveType === "helping"
    ? 0
    : damageSub(move, attacker, defencer, env);
};

export const fushigibana: Pokemon = pokemon(
  Pokedex.fushigibana,
  50,
  [Moves.seedBomb, Moves.protect],
  0,
  statistics(4, 0, 0, 252, 0, 252),
  statistics(31, 31, 31, 31, 31, 31),
  { up: "specialAttack", down: "attack" }
);

export const rizadon: Pokemon = pokemon(
  Pokedex.rizadon,
  50,
  [Moves.flamethrower, Moves.flareBlitz, Moves.growl, Moves.bellyDrum],
  0,
  statistics(0, 0, 0, 0, 0, 0),
  statistics(31, 31, 31, 31, 31, 31),
  null
);

export const kamex: Pokemon = pokemon(
  Pokedex.kamex,
  50,
  [Moves.surf, Moves.dragonPulse, Moves.ironDefence],
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
  [Moves.ancientPower, Moves.confusion, Moves.hypnosis],
  0,
  statistics(12, 252, 28, 0, 4, 212),
  statistics(31, 31, 31, 31, 31, 31),
  { up: "speed", down: "specialAttack" }
);

export const weavile: Pokemon = pokemon(
  Pokedex.weavile,
  50,
  [Moves.darkPulse, Moves.iceShard],
  0,
  statistics(4, 252, 0, 0, 0, 252),
  statistics(31, 31, 31, 31, 31, 31),
  { up: "speed", down: "specialAttack" }
);
