import { PokedexInfo } from "@/domain/model/pokemon";
import { statistics } from "@/domain/controller/stats";

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

export const magikarp: PokedexInfo = {
  no: 129,
  name: "コイキング",
  types: ["water"],
  baseStats: statistics(20, 10, 55, 15, 20, 80),
  abilities: ["すいすい", "びびり"],
};

export const breloom: PokedexInfo = {
  no: 286,
  name: "キノガッサ",
  types: ["grass", "poison"],
  baseStats: statistics(60, 130, 80, 60, 60, 70),
  abilities: ["ほうし", "ポイズンヒール", "テクニシャン"],
};

export const solrock: PokedexInfo = {
  no: 338,
  name: "ソルロック",
  types: ["rock", "psychic"],
  baseStats: statistics(90, 95, 85, 55, 65, 70),
  abilities: ["ふゆう"],
};

export const weavile: PokedexInfo = {
  no: 461,
  name: "マニューラ",
  types: ["dark", "ice"],
  baseStats: statistics(70, 120, 65, 45, 85, 125),
  abilities: ["プレッシャー", "わるいてぐせ"],
};
