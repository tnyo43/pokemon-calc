import {
  ActionCommandSet,
  PrepareCommandSet,
  Progress,
} from "@/domain/model/battle";
import {
  beHurt,
  convertStatus,
  damage,
  reducePP,
  speed as getSpeed,
  updateStatus,
} from "@/domain/controller/pokemon";
import { next, damage as weatherDamage } from "@/domain/controller/environment";
import {
  add,
  actionLog,
  changeLog,
  damageLog,
  koLog,
  prepareLog,
  resultLog,
  statusLog,
  turnendLog,
  weatherDamageLog,
  weatherLog,
  protectLog,
  protectSucceedLog,
  missLog,
  ailmentLog,
} from "@/domain/controller/log";
import {
  updatePokemon,
  currentPokemon,
  lose,
  needToChange,
} from "@/domain/controller/player";
import { Player } from "@/domain/model/player";
import { AttackMove, HelpingMove, Move } from "@/domain/model/move";
import { Config, defaultConfig } from "@/domain/config/battle";
import { probability } from "@/utils/random";

let config = defaultConfig;

export const apply = ({ battle }: { battle: Config }) => {
  config = battle;
};

const getConfig = () => config;

type PlayerKey = "playerA" | "playerB";

const playerKeys: PlayerKey[] = ["playerA", "playerB"];

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

type MoveElement = { move: Move; isA: boolean; speed: number };

const sortedMoves = (
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
    const move = pokemon.moves[index].move;
    const speed =
      (move.priority ? move.priority : 0) * priorityRatio +
      getSpeed(pokemon) +
      Math.random(); // for random iff some are same speed and priority
    return moves.concat({ move, isA, speed });
  };

  let moves: MoveElement[] = [];
  if (command.playerA.type === "fight")
    moves = addMove(moves, progress.playerA, true, command.playerA.index);
  if (command.playerB.type === "fight")
    moves = addMove(moves, progress.playerB, false, command.playerB.index);

  return moves.sort((m1, m2) => m2.speed - m1.speed);
};

const attack = (
  progress: Progress,
  isA: boolean,
  move: AttackMove,
  command: ActionCommandSet,
  hit: boolean
): Progress => {
  const [attackerKey, defencerKey]: PlayerKey[] = isA
    ? ["playerA", "playerB"]
    : ["playerB", "playerA"];
  const moveIndex = command[attackerKey].index;
  let [attacker, defencer] = [progress[attackerKey], progress[defencerKey]];
  const [attackPokemon, defencePokemon] = [
    currentPokemon(attacker),
    currentPokemon(defencer),
  ];
  const { environment } = progress;

  if (progress.winner || needToChange(attacker)) return progress;

  let log = progress.log;
  log = add(log, actionLog(attackPokemon, moveIndex));

  if (defencePokemon.condition.protect) {
    log = add(log, protectSucceedLog(defencePokemon));
  } else if (!hit) {
    log = add(log, missLog(defencePokemon));
  } else {
    const damageResult = damage(
      move,
      attackPokemon,
      defencePokemon,
      environment
    );
    defencer = updatePokemon(defencer, beHurt(defencePokemon, damageResult));
    log = add(log, damageLog(defencePokemon, damageResult));
  }

  attacker = updatePokemon(attacker, reducePP(attackPokemon, moveIndex, 1));

  let progressResult = {
    ...progress,
    log,
    [attackerKey]: attacker,
    [defencerKey]: defencer,
  };

  progressResult = judge(progressResult, defencerKey);
  progressResult = judge(progressResult, attackerKey);
  return progressResult;
};

const helping = (
  progress: Progress,
  isA: boolean,
  move: HelpingMove,
  command: ActionCommandSet,
  hit: boolean
) => {
  const [attackerKey, defencerKey]: PlayerKey[] = isA
    ? ["playerA", "playerB"]
    : ["playerB", "playerA"];
  const moveIndex = command[attackerKey].index;
  let [attacker, defencer] = [progress[attackerKey], progress[defencerKey]];

  if (progress.winner || needToChange(attacker)) return progress;

  let log = progress.log;

  log = add(log, actionLog(currentPokemon(attacker), moveIndex));
  if (
    currentPokemon(defencer).condition.protect &&
    (move.statusDiff?.opponent || move.ailment)
  ) {
    log = add(log, protectSucceedLog(currentPokemon(defencer)));
  } else if (!hit) {
    log = add(log, missLog(currentPokemon(defencer)));
  } else {
    if (move.statusDiff?.own) {
      log = add(
        log,
        statusLog(
          currentPokemon(attacker),
          convertStatus(currentPokemon(attacker), move.statusDiff?.own)
        )
      );
    }
    if (move.protect) {
      log = add(log, protectLog(currentPokemon(attacker)));
      attacker = updatePokemon(attacker, {
        ...currentPokemon(attacker),
        condition: {
          ...currentPokemon(attacker).condition,
          protect: true,
        },
      });
    }
    if (move.statusDiff?.opponent) {
      log = add(
        log,
        statusLog(
          currentPokemon(defencer),
          convertStatus(currentPokemon(defencer), move.statusDiff?.opponent)
        )
      );
    }
    if (move.ailment) {
      log = add(log, ailmentLog(currentPokemon(defencer), move.ailment));
      defencer = updatePokemon(defencer, {
        ...currentPokemon(defencer),
        condition: {
          ...currentPokemon(defencer).condition,
          ailment: move.ailment,
        },
      });
    }
  }

  return {
    ...progress,
    [attackerKey]: updatePokemon(
      attacker,
      updateStatus(
        currentPokemon(attacker),
        move.statusDiff?.own ? move.statusDiff?.own : {}
      )
    ),
    [defencerKey]: updatePokemon(
      defencer,
      updateStatus(
        currentPokemon(defencer),
        move.statusDiff?.opponent ? move.statusDiff?.opponent : {}
      )
    ),
    log,
  };
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

  const [first, second]: PlayerKey[] = isAFaster(progResult)
    ? ["playerA", "playerB"]
    : ["playerB", "playerA"];
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

  const [first, second]: PlayerKey[] = isAFaster(progResult)
    ? ["playerA", "playerB"]
    : ["playerB", "playerA"];
  progResult = updateCondition(progResult, first);
  progResult = judge(progResult, first);
  progResult = updateCondition(progResult, second);
  progResult = judge(progResult, second);

  return progResult;
};

const changePokemon = (
  progress: Progress,
  command: ActionCommandSet
): Progress => {
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

export const runAction = (
  progress: Progress,
  command: ActionCommandSet
): Progress => {
  if (progress.winner) return progress;

  let progResult = progress;
  progResult = changePokemon(progResult, command);

  const moves = sortedMoves(progResult, command);
  moves.forEach(({ move, isA }) => {
    const hit =
      move.accuracy === 100 ||
      getConfig().accuracy === "always" ||
      (getConfig().accuracy === "normal" && probability(move.accuracy / 100));
    progResult =
      move.moveType === "helping"
        ? helping(progResult, isA, move, command, hit)
        : attack(progResult, isA, move, command, hit);
  });

  progResult = updateEnvironment(progResult);
  progResult = passTurnCondition(progResult);

  return {
    ...progResult,
    log: add(progResult.log, turnendLog()),
  };
};

export const runPrepare = (
  progress: Progress,
  command: PrepareCommandSet
): Progress => {
  let progResult = progress;
  playerKeys.forEach((playerKey) => {
    const index = command[playerKey]?.index;
    const player = progress[playerKey];
    if (index) {
      progResult = {
        ...progResult,
        [playerKey]: {
          ...player,
          currentPokemon: index,
        },
        log: add(progress.log, prepareLog(player, index)),
      };
    }
  });
  if (command !== {})
    progResult = { ...progResult, log: add(progResult.log, turnendLog()) };
  return progResult;
};
