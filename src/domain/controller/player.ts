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

export const needToChange = (player: Player) => currentPokemon(player).dying;

export const canChange = (
  { pokemons, currentPokemon }: Player,
  index: number
) =>
  index >= 0 &&
  index < pokemons.length &&
  index !== currentPokemon &&
  !pokemons[index].dying;

export const change = (player: Player, index: number) =>
  canChange(player, index)
    ? { succeed: false, player }
    : { succeed: true, player: { ...player, currentPokemon: index } };

export const lose = (player: Player) => player.pokemons.every((p) => p.dying);
