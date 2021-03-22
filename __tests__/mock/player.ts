import { Player } from "@/domain/model/player";
import {
  fushigibana,
  kamex,
  pikachu,
  rizadon,
  solrock,
  weavile,
} from "__tests__/mock/pokemon";

export const playerA: Player = {
  name: "satoshi",
  currentPokemon: 0,
  pokemons: [rizadon, pikachu, solrock],
};

export const playerB: Player = {
  name: "shigeru",
  currentPokemon: 0,
  pokemons: [kamex, weavile, fushigibana],
};
