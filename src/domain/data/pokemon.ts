import { PokedexInfo, Pokemon } from "@/domain/model/pokemon";
import { statistics } from "@/domain/controller/stats";
import { pokemon } from "@/domain/controller/pokemon";
import * as Moves from "@/domain/data/moves";

const fushigibanaInfo: PokedexInfo = {
  no: 3,
  name: "フシギバナ",
  types: ["grass", "poison"],
  baseStats: statistics(80, 82, 83, 100, 100, 80),
  abilities: ["しんりょく"],
};

const rizadonInfo: PokedexInfo = {
  no: 6,
  name: "リザードン",
  types: ["fire", "flying"],
  baseStats: statistics(78, 84, 78, 109, 85, 100),
  abilities: ["もうか"],
};

const kamexInfo: PokedexInfo = {
  no: 9,
  name: "カメックス",
  types: ["water"],
  baseStats: statistics(79, 83, 100, 85, 105, 78),
  abilities: ["げきりゅう"],
};

const pikachuInfo: PokedexInfo = {
  no: 25,
  name: "ピカチュウ",
  types: ["electric"],
  baseStats: statistics(35, 55, 40, 50, 50, 90),
  abilities: ["せいでんき"],
};

const solrockInfo: PokedexInfo = {
  no: 338,
  name: "ソルロック",
  types: ["rock", "psychic"],
  baseStats: statistics(90, 95, 85, 55, 65, 70),
  abilities: ["ふゆう"],
};

const weavileInfo: PokedexInfo = {
  no: 461,
  name: "マニューラ",
  types: ["dark", "ice"],
  baseStats: statistics(70, 120, 65, 45, 85, 125),
  abilities: ["プレッシャー", "わるいてぐせ"],
};

export const fushigibana: Pokemon = pokemon(
  fushigibanaInfo,
  50,
  [Moves.seedBomb],
  0,
  statistics(4, 0, 0, 252, 0, 252),
  statistics(31, 31, 31, 31, 31, 31),
  { up: "specialAttack", down: "attack" }
);

export const rizadon: Pokemon = pokemon(
  rizadonInfo,
  50,
  [Moves.flamethrower, Moves.flareBlitz, Moves.dragonClaw],
  0,
  statistics(0, 0, 0, 0, 0, 0),
  statistics(31, 31, 31, 31, 31, 31),
  null
);

export const kamex: Pokemon = pokemon(
  kamexInfo,
  50,
  [Moves.surf, Moves.dragonPulse],
  0,
  statistics(0, 0, 0, 0, 0, 0),
  statistics(31, 31, 31, 31, 31, 31),
  null
);

export const pikachu: Pokemon = pokemon(
  pikachuInfo,
  50,
  [Moves.Thunderbolt, Moves.voltTackle, Moves.quickAttack],
  0,
  statistics(4, 252, 0, 0, 0, 252),
  statistics(31, 31, 31, 31, 31, 31),
  { up: "speed", down: "specialAttack" }
);

export const solrock: Pokemon = pokemon(
  solrockInfo,
  50,
  [Moves.ancientPower, Moves.confusion],
  0,
  statistics(12, 252, 28, 0, 4, 212),
  statistics(31, 31, 31, 31, 31, 31),
  { up: "speed", down: "specialAttack" }
);

export const weavile: Pokemon = pokemon(
  weavileInfo,
  50,
  [Moves.darkPulse, Moves.iceShard],
  0,
  statistics(4, 252, 0, 0, 0, 252),
  statistics(31, 31, 31, 31, 31, 31),
  { up: "speed", down: "specialAttack" }
);
