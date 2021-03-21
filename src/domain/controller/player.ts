import { Player } from "@/domain/model/player";
import { Pokemon } from "@/domain/model/pokemon";
import { Config, defaultConfig } from "@/domain/config/player";
import { displayStatus } from "@/domain/controller/pokemon";

let config = defaultConfig;

export const apply = ({ player }: { player: Config }) => {
  config = player;
};

const getConfig = () => config;

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

export const isLose = (player: Player) => player.pokemons.every((p) => p.dying);

export const display = (player: Player) => {
  if (!getConfig().debug) return;
  const pokemon = currentPokemon(player);
  const displayHpSize = 32;
  const hpLength = Math.floor(
    (pokemon.status.hp / pokemon.basicValue.hp) * displayHpSize
  );
  console.log(player.name);
  console.log(`| ${pokemon.name}[Lv. ${pokemon.level}]`);
  console.log(
    `| [${
      Array(hpLength).fill("#").join("") +
      Array(displayHpSize - hpLength)
        .fill(".")
        .join("")
    }]`
  );
  console.log(
    "| " +
      (
        Array(displayHpSize).fill(" ").join("") +
        `${pokemon.status.hp} / ${pokemon.basicValue.hp}`
      ).slice(-displayHpSize)
  );

  if (getConfig().type === "all") {
    displayStatus(pokemon, "| ");
  }
  console.log();
};
