import { PlayerKey, PrepareCommandSet, Progress } from "@/domain/model/battle";
import { beHurt, updateStatus } from "@/domain/controller/pokemon";
import {
  updateEnvironment,
  damage as weatherDamage,
} from "@/domain/controller/environment";
import * as Log from "@/domain/controller/log";
import { Log as LogType } from "@/domain/model/log";
import { judge, order } from "@/domain/controller/battle/utils";
import { updatePokemon, currentPokemon } from "@/domain/controller/player";
import { Pokemon } from "@/domain/model/pokemon";

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

  const resetProtect = (pokemon: Pokemon): Pokemon => ({
    ...pokemon,
    condition: {
      ...pokemon.condition,
      protect: false,
    },
  });

  const damageByAilment = (
    pokemon: Pokemon,
    log: LogType[]
  ): [Pokemon, LogType[]] => {
    const ailment = pokemon.condition.ailment;
    if (!ailment) return [pokemon, log];
    const damage =
      ailment.label === "poison"
        ? Math.max(1, Math.floor(pokemon.basicValue.hp / 8))
        : ailment.label === "bad poison"
        ? Math.max(
            Math.floor(
              (Math.min(15, ailment.past) * pokemon.basicValue.hp) / 16
            )
          )
        : ailment.label === "burn"
        ? Math.max(1, Math.floor(pokemon.basicValue.hp / 16))
        : 0;
    if (
      ailment.label === "poison" ||
      ailment.label === "bad poison" ||
      ailment.label === "burn"
    ) {
      log = Log.add(log, Log.ailmentDamage(pokemon, ailment.label));
    }
    return [updateStatus(pokemon, { hp: -damage }), log];
  };

  const updateAilment = (pokemon: Pokemon): Pokemon => {
    const ailment = pokemon.condition.ailment;
    if (ailment?.label === "bad poison") {
      ailment.past += 1;
    }
    return {
      ...pokemon,
      condition: {
        ...pokemon.condition,
        ailment,
      },
    };
  };

  const updateCondition = (progress: Progress, playerKey: PlayerKey) => {
    let pokemon = currentPokemon(progress[playerKey]);
    let log = progress.log;
    pokemon = resetProtect(pokemon);
    [pokemon, log] = damageByAilment(pokemon, log);
    pokemon = updateAilment(pokemon);
    return {
      ...progress,
      [playerKey]: updatePokemon(progress[playerKey], pokemon),
      log,
    };
  };

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
