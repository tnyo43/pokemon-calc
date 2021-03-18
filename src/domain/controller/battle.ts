import { Command, Progress } from "@/domain/model/battle";
import { damage, speed, updateStatus } from "@/domain/controller/pokemon";
import { probability } from "@/utils";
import { next, damage as weatherDamage } from "@/domain/controller/environment";
import { Pokemon } from "@/domain/model/pokemon";
import {
  add,
  attackLog,
  damageLog,
  koLog,
  Log,
  weatherDamageLog,
  weatherLog,
} from "@/domain/model/log";
import { priority } from "@/domain/controller/move";
import { updatePokemon, currentPokemon } from "@/domain/controller/player";

type Action = { isAttackerA: boolean; moveIndex: number };

const beHurt = (pokemon: Pokemon, damage: number) =>
  updateStatus(pokemon, { hp: -damage });

const attack = (progress: Progress, action: Action): Progress => {
  const { playerA, playerB, environment } = progress;
  const [pokemonA, pokemonB] = [
    currentPokemon(playerA),
    currentPokemon(playerB),
  ];
  let log = progress.log;

  const [attacker, defencer] = action.isAttackerA
    ? [pokemonA, pokemonB]
    : [pokemonB, pokemonA];
  log = add(log, attackLog(attacker, action.moveIndex));
  const damageResult = damage(
    action.moveIndex,
    attacker,
    defencer,
    environment
  );
  const defencedPlayer = updatePokemon(
    action.isAttackerA ? playerB : playerA,
    beHurt(defencer, damageResult)
  );
  log = add(log, damageLog(defencer, damageResult));

  return {
    ...progress,
    log,
    [action.isAttackerA ? "playerB" : "playerA"]: defencedPlayer,
  };
};

const updateEnvironment = (progress: Progress, isFirstA: boolean): Progress => {
  const { playerA, playerB, environment } = progress;
  let [pokemonA, pokemonB] = [currentPokemon(playerA), currentPokemon(playerB)];

  const nextEnvironment = next(environment);
  const weather =
    environment.weather === "none" ? null : environment.weather.value;

  let log = progress.log;
  if (weather) {
    log = add(log, weatherLog(weather, nextEnvironment.weather === "none"));
  }

  const beHurtByWeather = (pokemon: Pokemon, log: Log[]): [Pokemon, Log[]] => {
    let result = pokemon;
    const damage = weatherDamage(nextEnvironment, pokemon);
    if (!pokemon.dying && damage && weather) {
      result = beHurt(pokemon, damage);
      log = add(log, weatherDamageLog(weather, pokemon));
    }
    return [result, log];
  };

  if (weather) {
    if (isFirstA) {
      [pokemonA, log] = beHurtByWeather(pokemonA, log);
      [pokemonB, log] = beHurtByWeather(pokemonB, log);
    } else {
      [pokemonB, log] = beHurtByWeather(pokemonB, log);
      [pokemonA, log] = beHurtByWeather(pokemonA, log);
    }
  }

  return {
    playerA: updatePokemon(playerA, pokemonA),
    playerB: updatePokemon(playerB, pokemonB),
    environment: nextEnvironment,
    log,
  };
};

export const run = (progress: Progress, command: Command): Progress => {
  const { playerA, playerB } = progress;
  const [pokemonA, pokemonB] = [
    currentPokemon(playerA),
    currentPokemon(playerB),
  ];
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
  const [first, second]: ("playerA" | "playerB")[] = isFirstA
    ? ["playerA", "playerB"]
    : ["playerB", "playerA"];

  const judge = (
    progress: Progress,
    playerKey: "playerA" | "playerB"
  ): Progress => {
    const player = progress[playerKey];
    const poke = currentPokemon(player);
    if (poke.dying || poke.status.hp) return progress;
    return {
      ...progress,
      [playerKey]: updatePokemon(player, { ...poke, dying: true }),
      log: add(progress.log, koLog(poke)),
    };
  };

  let progResult = attack(progress, {
    isAttackerA: isFirstA,
    moveIndex: command[first],
  });
  progResult = judge(progResult, second);
  progResult = judge(progResult, first);

  if (!currentPokemon(progResult[second]).dying) {
    progResult = attack(progResult, {
      isAttackerA: !isFirstA,
      moveIndex: command[second],
    });
    progResult = judge(progResult, first);
    progResult = judge(progResult, second);
  }

  progResult = updateEnvironment(progResult, isFirstA);
  progResult = judge(progResult, first);
  progResult = judge(progResult, second);
  return progResult;
};
