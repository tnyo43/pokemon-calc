import { PlayerKey, PrepareCommandSet, Progress } from "@/domain/model/battle";
import { beHurt } from "@/domain/controller/pokemon";
import {
  updateEnvironment,
  damage as weatherDamage,
} from "@/domain/controller/environment";
import * as Log from "@/domain/controller/log";
import { judge, order } from "@/domain/controller/battle/utils";
import { updatePokemon, currentPokemon } from "@/domain/controller/player";

const passTurnEnvironment = (progress: Progress): Progress => {
  if (progress.winner) return progress;
  let progResult = progress;

  const { environment } = progResult;

  const nextEnvironment = updateEnvironment(environment);
  if (environment.weather !== "none") {
    progResult = {
      ...progResult,
      log: Log.add(
        progResult.log,
        Log.weather(
          environment.weather.value,
          nextEnvironment.weather === "none"
        )
      ),
    };
  }

  const beHurtByWeather = (
    progress: Progress,
    playerKey: PlayerKey
  ): Progress => {
    let pokemon = currentPokemon(progress[playerKey]);
    const damage = weatherDamage(nextEnvironment, pokemon);
    let log = progress.log;
    if (!pokemon.dying && damage && nextEnvironment.weather !== "none") {
      pokemon = beHurt(pokemon, damage);
      log = Log.add(
        log,
        Log.weatherDamage(nextEnvironment.weather.value, pokemon)
      );
    }
    return {
      ...progress,
      log,
      [playerKey]: updatePokemon(progress[playerKey], pokemon),
    };
  };

  const [first, second]: PlayerKey[] = order(progress);
  progResult = beHurtByWeather(progResult, first);
  progResult = judge(progResult, first);
  progResult = beHurtByWeather(progResult, second);
  progResult = judge(progResult, second);

  return {
    ...progResult,
    environment: nextEnvironment,
  };
};

const passTurnCondition = (progress: Progress) => {
  let progResult = progress;

  const updateCondition = (progress: Progress, playerKey: PlayerKey) => ({
    ...progress,
    [playerKey]: updatePokemon(progress[playerKey], {
      ...currentPokemon(progress[playerKey]),
      condition: {
        ...currentPokemon(progress[playerKey]).condition,
        protect: false,
      },
    }),
  });

  const [first, second]: PlayerKey[] = order(progress);
  progResult = updateCondition(progResult, first);
  progResult = judge(progResult, first);
  progResult = updateCondition(progResult, second);
  progResult = judge(progResult, second);

  return progResult;
};

export const runPrepare = (
  progress: Progress,
  command: PrepareCommandSet
): Progress => {
  let progResult = progress;
  order(progress).forEach((playerKey) => {
    const index = command[playerKey]?.index;
    const player = progress[playerKey];
    if (index) {
      progResult = {
        ...progResult,
        [playerKey]: {
          ...player,
          currentPokemon: index,
        },
        log: Log.add(progress.log, Log.prepare(player, index)),
      };
    }
  });
  if (command !== {})
    progResult = { ...progResult, log: Log.add(progResult.log, Log.turnend()) };
  return progResult;
};

export const passTurn = (progress: Progress) => {
  let progResult = passTurnEnvironment(progress);
  progResult = passTurnCondition(progResult);

  return {
    ...progResult,
    log: Log.add(progResult.log, Log.turnend()),
  };
};
