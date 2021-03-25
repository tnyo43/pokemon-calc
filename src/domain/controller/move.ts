import { AttackMove, Move } from "@/domain/model/move";
import { Config, defaultConfig } from "@/domain/config/move";
import { probability } from "@/utils/random";
import { ActionCommandSet, Progress } from "@/domain/model/battle";
import { Player } from "@/domain/model/player";
import { speed as getSpeed } from "@/domain/controller/pokemon";
import { currentPokemon } from "@/domain/controller/player";
import {
  affectedEnvironment,
  isTerrainActive,
} from "@/domain/controller/environment";
import { Pokemon } from "@/domain/model/pokemon";
import { Environment } from "@/domain/model/environment";

let config = defaultConfig;

export const apply = ({ battle }: { battle: Partial<Config> }) => {
  config = {
    ...config,
    ...battle,
  };
};

const getConfig = () => config;

const priority = (move: Move) => (move.priority ? move.priority : 0);

export const isHit = (move: Move) =>
  move.accuracy === 100 ||
  getConfig().hit === "always" ||
  (getConfig().hit === "probability" && probability(move.accuracy / 100));

export const isSideEffectHappen = (move: AttackMove) => {
  const percentage = move.sideEffect?.ailment
    ? move.sideEffect.ailment.percentage
    : 0;
  return (
    getConfig().sideEffect === "always" ||
    (getConfig().sideEffect === "probability" && probability(percentage / 100))
  );
};

type MoveElement = { move: Move; isA: boolean; speed: number };

export const sortedMoves = (
  progress: Progress,
  command: ActionCommandSet
): Omit<MoveElement, "speed">[] => {
  const priorityRatio = 1000;

  const addMove = (
    moves: MoveElement[],
    player: Player,
    isA: boolean,
    index: number
  ): MoveElement[] => {
    const pokemon = currentPokemon(player);
    const move = pokemon.moves[index];

    // for random iff some are same speed and priority
    const speed =
      priority(move) * priorityRatio + getSpeed(pokemon) + Math.random();
    return moves.concat({ move, isA, speed });
  };

  let moves: MoveElement[] = [];
  if (command.playerA.type === "fight")
    moves = addMove(moves, progress.playerA, true, command.playerA.index);
  if (command.playerB.type === "fight")
    moves = addMove(moves, progress.playerB, false, command.playerB.index);

  return moves.sort((m1, m2) => m2.speed - m1.speed);
};

export const isSuccessMove = (
  move: Move,
  pokemon: Pokemon,
  environment: Environment
) =>
  !(
    move.priority &&
    move.priority > 0 &&
    isTerrainActive(affectedEnvironment(environment, pokemon), "psychic") &&
    (move.moveType !== "helping" || move.statusDiff?.opponent || move.ailment)
  );
