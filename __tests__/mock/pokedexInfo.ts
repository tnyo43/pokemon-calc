import { PokedexInfo } from "@/domain/model/pokemon";
import { statistics } from "@/domain/service/stats";

export const fushigibana: PokedexInfo = {
  no: 3,
  name: "フシギバナ",
  types: ["grass", "poison"],
  baseStats: statistics(80, 82, 83, 100, 100, 80),
  abilities: ["しんりょく"],
};

export const rizadon: PokedexInfo = {
  no: 6,
  name: "リザードン",
  types: ["fire", "flying"],
  baseStats: statistics(78, 84, 78, 109, 85, 100),
  abilities: ["もうか"],
};

export const kamex: PokedexInfo = {
  no: 9,
  name: "カメックス",
  types: ["water"],
  baseStats: statistics(79, 83, 100, 85, 105, 78),
  abilities: ["げきりゅう"],
};

export const pikachu: PokedexInfo = {
  no: 25,
  name: "ピカチュウ",
  types: ["electric"],
  baseStats: statistics(35, 55, 40, 50, 50, 90),
  abilities: ["せいでんき"],
};
