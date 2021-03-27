import { AttackMove, Move } from "@/domain/model/move";
import { Config, defaultConfig } from "@/config/move";
import { probability } from "@/utils/random";
import {
  affectedEnvironment,
  isTerrainActive,
} from "@/domain/controller/environment";
import { Pokemon } from "@/domain/model/pokemon";
import { Environment } from "@/domain/model/environment";

let config = defaultConfig;

export const applySub = ({ battle }: { battle: Partial<Config> }) => {
  config = {
    ...config,
    ...battle,
  };
};
export const apply = ({ move }: { move: Config }) => {
  config = move;
};

const getConfig = () => config;

export const priority = (move: Move) => (move.priority ? move.priority : 0);

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
