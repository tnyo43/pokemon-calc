import { Command, Progress } from "@/domain/model/battle";
import { beHurt, damage, speed } from "@/domain/controller/pokemon";
import { probability } from "@/utils";
import { next, damage as weatherDamage } from "@/domain/controller/environment";
import { Pokemon } from "@/domain/model/pokemon";
import {
  add,
  attackLog,
  damageLog,
  koLog,
  Log,
  resultLog,
  weatherDamageLog,
  weatherLog,
} from "@/domain/model/log";
import { priority } from "@/domain/controller/move";
import {
  updatePokemon,
  currentPokemon,
  lose,
  needToChange,
} from "@/domain/controller/player";

type Action = { isAttackerA: boolean; moveIndex: number };

const attack = (progress: Progress, action: Action): Progress => {
  if (progress.winner) return progress;

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

const updateEnvironment = (
  progress: Progress,
  isAFaster: boolean
): Progress => {
  if (progress.winner) return progress;

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
    if (isAFaster) {
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

const judge = (
  progress: Progress,
  playerKey: "playerA" | "playerB"
): Progress => {
  if (progress.winner) return progress;

  const player = progress[playerKey];
  const pokemon = currentPokemon(player);
  if (pokemon.dying || pokemon.status.hp) return progress;

  let log = add(progress.log, koLog(pokemon));
  let winner: "A" | "B" | undefined = undefined;
  const updatedPlayer = updatePokemon(player, { ...pokemon, dying: true });
  if (lose(updatedPlayer)) {
    log = add(log, resultLog(playerKey !== "playerA", progress.playerB));
    winner = playerKey === "playerA" ? "A" : "B";
  }
  return {
    ...progress,
    [playerKey]: updatedPlayer,
    log,
    winner,
  };
};

export const run = (progress: Progress, command: Command): Progress => {
  if (progress.winner) return progress;

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
  const isAFaster =
    priorityDiff > 0 ||
    (priorityDiff === 0 &&
      (speedDiff > 0 || (speedDiff === 0 && probability(0.5))));
  const [first, second]: ("playerA" | "playerB")[] = isAFaster
    ? ["playerA", "playerB"]
    : ["playerB", "playerA"];

  let progResult = attack(progress, {
    isAttackerA: isAFaster,
    moveIndex: command[first],
  });
  progResult = judge(progResult, second);
  progResult = judge(progResult, first);

  if (!needToChange(progResult[second])) {
    progResult = attack(progResult, {
      isAttackerA: !isAFaster,
      moveIndex: command[second],
    });
    progResult = judge(progResult, first);
    progResult = judge(progResult, second);
  }

  progResult = updateEnvironment(progResult, isAFaster);
  progResult = judge(progResult, first);
  progResult = judge(progResult, second);
  return progResult;
};
