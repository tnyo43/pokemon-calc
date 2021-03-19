import { Commands, Progress } from "@/domain/model/battle";
import { beHurt, damage, speed as getSpeed } from "@/domain/controller/pokemon";
import { next, damage as weatherDamage } from "@/domain/controller/environment";
import {
  add,
  attackLog,
  changeLog,
  damageLog,
  koLog,
  resultLog,
  turnendLog,
  weatherDamageLog,
  weatherLog,
} from "@/domain/controller/log";
import {
  updatePokemon,
  currentPokemon,
  lose,
  needToChange,
} from "@/domain/controller/player";
import { Player } from "@/domain/model/player";

type PlayerKey = "playerA" | "playerB";

const isAFaster = (progress: Progress): boolean => {
  const [pokemonA, pokemonB] = [
    currentPokemon(progress.playerA),
    currentPokemon(progress.playerB),
  ];
  return getSpeed(pokemonA) - getSpeed(pokemonB) + Math.random() - 0.5 > 0;
};

const judge = (progress: Progress, playerKey: PlayerKey): Progress => {
  if (progress.winner) return progress;

  const player = progress[playerKey];
  const pokemon = currentPokemon(player);
  if (pokemon.dying || pokemon.status.hp) return progress;

  let log = add(progress.log, koLog(pokemon));
  let winner: "playerA" | "playerB" | undefined = undefined;
  const updatedPlayer = updatePokemon(player, { ...pokemon, dying: true });
  if (lose(updatedPlayer)) {
    log = add(log, resultLog(playerKey !== "playerA", progress.playerB));
    winner = playerKey === "playerA" ? "playerB" : "playerA";
  }
  return {
    ...progress,
    [playerKey]: updatedPlayer,
    log,
    winner,
  };
};

const sortedMoves = (
  progress: Progress,
  command: Commands
): { isA: boolean }[] => {
  const priorityRatio = 1000;

  const addMove = (
    moves: { isA: boolean; speed: number }[],
    player: Player,
    isA: boolean,
    index: number
  ): { isA: boolean; speed: number }[] => {
    const pokemon = currentPokemon(player);
    const move = pokemon.moves[index];
    const speed =
      (move.proprity ? move.proprity : 0) * priorityRatio +
      getSpeed(pokemon) +
      Math.random(); // for random iff some are same speed and priority
    return moves.concat({ isA, speed });
  };

  let moves: { isA: boolean; speed: number }[] = [];
  if (command.playerA.type === "fight")
    moves = addMove(moves, progress.playerA, true, command.playerA.index);
  if (command.playerB.type === "fight")
    moves = addMove(moves, progress.playerB, false, command.playerB.index);

  return moves.sort((m1, m2) => m2.speed - m1.speed);
};

const attack = (
  progress: Progress,
  isAttackerA: boolean,
  command: Commands
): Progress => {
  const { playerA, playerB, environment } = progress;
  const [pokemonA, pokemonB] = [
    currentPokemon(playerA),
    currentPokemon(playerB),
  ];
  const [attackPokemon, defencePokemon] = isAttackerA
    ? [pokemonA, pokemonB]
    : [pokemonB, pokemonA];
  const [attacker, defencer]: PlayerKey[] = isAttackerA
    ? ["playerA", "playerB"]
    : ["playerB", "playerA"];

  if (progress.winner || needToChange(progress[attacker])) return progress;

  const moveIndex = command[attacker].index;
  let log = progress.log;

  log = add(log, attackLog(attackPokemon, moveIndex));
  const damageResult = damage(
    moveIndex,
    attackPokemon,
    defencePokemon,
    environment
  );
  const defencedPlayer = updatePokemon(
    progress[defencer],
    beHurt(defencePokemon, damageResult)
  );
  log = add(log, damageLog(defencePokemon, damageResult));

  let progressResult = {
    ...progress,
    log,
    [defencer]: defencedPlayer,
  };
  progressResult = judge(progressResult, defencer);
  progressResult = judge(progressResult, attacker);
  return progressResult;
};

const updateEnvironment = (progress: Progress): Progress => {
  if (progress.winner) return progress;
  let progResult = progress;

  const { environment } = progResult;

  const nextEnvironment = next(environment);
  if (environment.weather !== "none") {
    progResult = {
      ...progResult,
      log: add(
        progResult.log,
        weatherLog(
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
      log = add(log, weatherDamageLog(nextEnvironment.weather.value, pokemon));
    }
    return {
      ...progress,
      log,
      [playerKey]: updatePokemon(progress[playerKey], pokemon),
    };
  };

  if (isAFaster(progResult)) {
    progResult = beHurtByWeather(progResult, "playerA");
    progResult = judge(progResult, "playerA");
    progResult = beHurtByWeather(progResult, "playerB");
    progResult = judge(progResult, "playerB");
  } else {
    progResult = beHurtByWeather(progResult, "playerB");
    progResult = judge(progResult, "playerB");
    progResult = beHurtByWeather(progResult, "playerA");
    progResult = judge(progResult, "playerA");
  }

  return {
    ...progResult,
    environment: nextEnvironment,
  };
};

const changePokemon = (progress: Progress, command: Commands): Progress => {
  const change = (progress: Progress, playerKey: PlayerKey): Progress => {
    if (command[playerKey].type !== "change") return progress;

    const player = progress[playerKey];
    const nextPokemon = command[playerKey].index;
    return {
      ...progress,
      [playerKey]: {
        ...player,
        currentPokemon: nextPokemon,
      },
      log: add(
        progress.log,
        changeLog(player, player.currentPokemon, nextPokemon)
      ),
    };
  };

  let progResult = progress;

  const playerKeys: PlayerKey[] = isAFaster(progress)
    ? ["playerA", "playerB"]
    : ["playerB", "playerA"];
  playerKeys.forEach((player) => (progResult = change(progResult, player)));

  return progResult;
};

export const run = (progress: Progress, command: Commands): Progress => {
  if (progress.winner) return progress;

  let progResult = progress;
  progResult = changePokemon(progResult, command);

  const moves = sortedMoves(progResult, command);
  moves.forEach(({ isA }) => (progResult = attack(progResult, isA, command)));

  progResult = updateEnvironment(progResult);

  return {
    ...progResult,
    log: add(progResult.log, turnendLog()),
  };
};
