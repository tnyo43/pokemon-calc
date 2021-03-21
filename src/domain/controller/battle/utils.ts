import { PlayerKey, Progress } from "@/domain/model/battle";
import { speed as getSpeed } from "@/domain/controller/pokemon";
import * as Log from "@/domain/controller/log";
import {
  currentPokemon,
  isLose,
  updatePokemon,
} from "@/domain/controller/player";

const isAFaster = (progress: Progress): boolean => {
  const [pokemonA, pokemonB] = [
    currentPokemon(progress.playerA),
    currentPokemon(progress.playerB),
  ];
  return getSpeed(pokemonA) - getSpeed(pokemonB) + Math.random() - 0.5 > 0;
};

export const order = (progress: Progress): PlayerKey[] =>
  isAFaster(progress) ? ["playerA", "playerB"] : ["playerB", "playerA"];

export const judge = (progress: Progress, playerKey: PlayerKey): Progress => {
  if (progress.winner) return progress;

  const player = progress[playerKey];
  const pokemon = currentPokemon(player);
  if (pokemon.dying || pokemon.status.hp) return progress;

  let log = Log.add(progress.log, Log.ko(pokemon));
  let winner: PlayerKey | undefined = undefined;
  const updatedPlayer = updatePokemon(player, { ...pokemon, dying: true });
  if (isLose(updatedPlayer)) {
    log = Log.add(log, Log.result(playerKey !== "playerA", progress.playerB));
    winner = playerKey === "playerA" ? "playerB" : "playerA";
  }
  return {
    ...progress,
    [playerKey]: updatedPlayer,
    log,
    winner,
  };
};
