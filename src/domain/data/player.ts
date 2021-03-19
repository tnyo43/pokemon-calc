import { Player } from "@/domain/model/player";
import {
  fushigibana,
  kamex,
  pikachu,
  rizadon,
  solrock,
  weavile,
} from "@/domain/data/pokemon";

export const player1: Player = {
  name: "satoshi",
  currentPokemon: 0,
  pokemons: [pikachu, rizadon, solrock],
};

export const player2: Player = {
  name: "shigeru",
  currentPokemon: 0,
  pokemons: [kamex, weavile, fushigibana],
};
