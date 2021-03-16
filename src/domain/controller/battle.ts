import { Command, Progress } from "@/domain/model/battle";
import { damage, speed, updateStatus } from "@/domain/controller/pokemon";
import { probability } from "@/utils";
import { MoveIndex } from "@/domain/model/move";
import { next, damage as weatherDamage } from "@/domain/controller/environment";
import { Pokemon } from "@/domain/model/pokemon";

type Action = { isAttackerA: boolean; moveIndex: MoveIndex };

const beHurt = (pokemon: Pokemon, damage: number) =>
  updateStatus(pokemon, { hp: -damage });

const attack = (progress: Progress, action: Action): Progress => {
  const { pokemonA, pokemonB, environment } = progress;
  const [attacker, defencer] = action.isAttackerA
    ? [pokemonA, pokemonB]
    : [pokemonB, pokemonA];
  const nextDefencer = beHurt(
    defencer,
    damage(action.moveIndex, attacker, defencer, environment)
  );

  return {
    ...progress,
    [action.isAttackerA ? "pokemonB" : "pokemonA"]: nextDefencer,
  };
};

const updateEnvironment = (progress: Progress, isFirstA: boolean): Progress => {
  const { pokemonA, pokemonB, environment } = progress;
  const nextEnvironment = next(environment);
  const damageA = weatherDamage(nextEnvironment, pokemonA);
  const damageB = weatherDamage(nextEnvironment, pokemonB);

  let damagedA: Pokemon;
  let damagedB: Pokemon;
  if (isFirstA) {
    damagedA = beHurt(pokemonA, damageA);
    damagedB = beHurt(pokemonB, damageB);
  } else {
    damagedB = beHurt(pokemonB, damageB);
    damagedA = beHurt(pokemonA, damageA);
  }
  return {
    pokemonA: damagedA,
    pokemonB: damagedB,
    environment: nextEnvironment,
  };
};

export const run = (progress: Progress, command: Command): Progress => {
  const { pokemonA, pokemonB } = progress;
  const speedDiff = speed(pokemonA) - speed(pokemonB);
  const isFirstA = speedDiff > 0 || (speedDiff === 0 && probability(0.5));
  const progFirst = attack(progress, {
    isAttackerA: isFirstA,
    moveIndex: command[isFirstA ? "playerA" : "playerB"],
  });
  const progSecond = attack(progFirst, {
    isAttackerA: !isFirstA,
    moveIndex: command[isFirstA ? "playerB" : "playerA"],
  });
  const progWeather = updateEnvironment(progSecond, isFirstA);
  return progWeather;
};
