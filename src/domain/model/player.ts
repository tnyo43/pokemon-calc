import { Pokemon } from "@/domain/model/pokemon";

export type Player = {
  name: string;
  pokemons: Pokemon[];
  currentPokemon: number;
};
