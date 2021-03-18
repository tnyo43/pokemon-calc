import { Player } from "@/domain/model/player";
import { Pokemon } from "@/domain/model/pokemon";

export const updatePokemon = (player: Player, pokemon: Pokemon): Player => ({
  ...player,
  pokemons: player.pokemons.map((p, i) =>
    i === player.currentPokemon ? pokemon : p
  ),
});

export const currentPokemon = ({ pokemons, currentPokemon }: Player) =>
  pokemons[currentPokemon];
