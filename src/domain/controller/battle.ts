import { Command, Progress } from "@/domain/model/battle";
import { damage, speed, updateStatus } from "@/domain/controller/pokemon";
import { probability } from "@/utils";
import { MoveIndex } from "@/domain/model/move";
import { next, damage as weatherDamage } from "@/domain/controller/environment";
import { Pokemon } from "@/domain/model/pokemon";
import {
  attackLog,
  damageLog,
  Log,
  weatherDamageLog,
  weatherLog,
} from "@/domain/model/log";
import { priority } from "@/domain/controller/move";

type Action = { isAttackerA: boolean; moveIndex: MoveIndex };

const beHurt = (pokemon: Pokemon, damage: number) =>
  updateStatus(pokemon, { hp: -damage });

const attack = (progress: Progress, action: Action): Progress => {
  const { pokemonA, pokemonB, environment, log } = progress;
  const [attacker, defencer] = action.isAttackerA
    ? [pokemonA, pokemonB]
    : [pokemonB, pokemonA];
  const nextLog = log.concat(attackLog(attacker, action.moveIndex));
  const damageResult = damage(
    action.moveIndex,
    attacker,
    defencer,
    environment
  );
  const nextDefencer = beHurt(defencer, damageResult);
  nextLog.push(damageLog(defencer, damageResult));

  return {
    ...progress,
    log: nextLog,
    [action.isAttackerA ? "pokemonB" : "pokemonA"]: nextDefencer,
  };
};

const updateEnvironment = (progress: Progress, isFirstA: boolean): Progress => {
  const { pokemonA, pokemonB, environment } = progress;
  const nextEnvironment = next(environment);
  const weather =
    environment.weather === "none" ? null : environment.weather.value;

  let log = progress.log;
  if (weather) {
    log = log.concat(weatherLog(weather, nextEnvironment.weather === "none"));
  }

  const beHurtByWeather = (pokemon: Pokemon, log: Log[]): [Pokemon, Log[]] => {
    let result = pokemon;
    const damage = weatherDamage(nextEnvironment, pokemon);
    if (damage && weather) {
      result = beHurt(pokemon, damage);
      log = log.concat(weatherDamageLog(weather, pokemon));
    }
    return [result, log];
  };

  let damagedA: Pokemon = pokemonA;
  let damagedB: Pokemon = pokemonB;
  if (weather) {
    if (isFirstA) {
      [damagedA, log] = beHurtByWeather(pokemonA, log);
      [damagedB, log] = beHurtByWeather(pokemonB, log);
    } else {
      [damagedB, log] = beHurtByWeather(pokemonB, log);
      [damagedA, log] = beHurtByWeather(pokemonA, log);
    }
  }

  return {
    pokemonA: damagedA,
    pokemonB: damagedB,
    environment: nextEnvironment,
    log,
  };
};

export const run = (progress: Progress, command: Command): Progress => {
  const { pokemonA, pokemonB } = progress;
  const [moveA, moveB] = [
    pokemonA.moves[command.playerA],
    pokemonB.moves[command.playerB],
  ];
  const priorityDiff = priority(moveA) - priority(moveB);
  const speedDiff = speed(pokemonA) - speed(pokemonB);
  const isFirstA =
    priorityDiff > 0 ||
    (priorityDiff === 0 &&
      (speedDiff > 0 || (speedDiff === 0 && probability(0.5))));

  let progResult = attack(progress, {
    isAttackerA: isFirstA,
    moveIndex: command[isFirstA ? "playerA" : "playerB"],
  });
  progResult = attack(progResult, {
    isAttackerA: !isFirstA,
    moveIndex: command[isFirstA ? "playerB" : "playerA"],
  });
  progResult = updateEnvironment(progResult, isFirstA);
  return progResult;
};
