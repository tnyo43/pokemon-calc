import { Player } from "@/domain/model/player";
import { Pokemon } from "@/domain/model/pokemon";
import {
  fushigibana,
  kamex,
  pikachu,
  rizadon,
  solrock,
  weavile,
} from "__tests__/mock/pokemon";

export const player = (pokemons: Pokemon[], name?: string): Player => ({
  name: name ? name : "satoshi",
  currentPokemon: 0,
  pokemons,
});

export const playerA: Player = player([rizadon, pikachu, solrock], "satoshi");
export const playerB: Player = player([kamex, weavile, fushigibana], "shigeru");
