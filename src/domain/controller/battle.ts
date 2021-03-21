import {
  ActionCommandSet,
  PlayerKey,
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
import {
  updateEnvironment,
  damage as weatherDamage,
} from "@/domain/controller/environment";
import * as Log from "@/domain/controller/log";
import {
  updatePokemon,
  currentPokemon,
  lose,
  needToChange,
} from "@/domain/controller/player";
import { AttackMove, HelpingMove } from "@/domain/model/move";
import { isHit, sortedMoves } from "@/domain/controller/move";

const isAFaster = (progress: Progress): boolean => {
  const [pokemonA, pokemonB] = [
    currentPokemon(progress.playerA),
    currentPokemon(progress.playerB),
  ];
  return getSpeed(pokemonA) - getSpeed(pokemonB) + Math.random() - 0.5 > 0;
};

const order = (progress: Progress): PlayerKey[] =>
  isAFaster(progress) ? ["playerA", "playerB"] : ["playerB", "playerA"];

const judge = (progress: Progress, playerKey: PlayerKey): Progress => {
  if (progress.winner) return progress;

  const player = progress[playerKey];
  const pokemon = currentPokemon(player);
  if (pokemon.dying || pokemon.status.hp) return progress;

  let log = Log.add(progress.log, Log.ko(pokemon));
  let winner: PlayerKey | undefined = undefined;
  const updatedPlayer = updatePokemon(player, { ...pokemon, dying: true });
  if (lose(updatedPlayer)) {
    log = Log.add(log, Log.result(playerKey !== "playerA", progress.playerB));
    winner = playerKey === "playerA" ? "playerB" : "playerA";
  }
  return {
    ...progress,
    [playerKey]: updatedPlayer,
    log,
    winner,
  };
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
  log = Log.add(log, Log.action(attackPokemon, moveIndex));

  if (defencePokemon.condition.protect) {
    log = Log.add(log, Log.protectSucceed(defencePokemon));
  } else if (!hit) {
    log = Log.add(log, Log.miss(defencePokemon));
  } else {
    const damageResult = damage(
      move,
      attackPokemon,
      defencePokemon,
      environment
    );
    defencer = updatePokemon(defencer, beHurt(defencePokemon, damageResult));
    log = Log.add(log, Log.damage(defencePokemon, damageResult));
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

  log = Log.add(log, Log.action(currentPokemon(attacker), moveIndex));
  if (
    currentPokemon(defencer).condition.protect &&
    (move.statusDiff?.opponent || move.ailment)
  ) {
    log = Log.add(log, Log.protectSucceed(currentPokemon(defencer)));
  } else if (!hit) {
    log = Log.add(log, Log.miss(currentPokemon(defencer)));
  } else {
    if (move.statusDiff?.own) {
      log = Log.add(
        log,
        Log.status(
          currentPokemon(attacker),
          convertStatus(currentPokemon(attacker), move.statusDiff?.own)
        )
      );
    }
    if (move.protect) {
      log = Log.add(log, Log.protect(currentPokemon(attacker)));
      attacker = updatePokemon(attacker, {
        ...currentPokemon(attacker),
        condition: {
          ...currentPokemon(attacker).condition,
          protect: true,
        },
      });
    }
    if (move.statusDiff?.opponent) {
      log = Log.add(
        log,
        Log.status(
          currentPokemon(defencer),
          convertStatus(currentPokemon(defencer), move.statusDiff?.opponent)
        )
      );
    }
    if (move.ailment) {
      log = Log.add(log, Log.ailment(currentPokemon(defencer), move.ailment));
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
      log: Log.add(
        progress.log,
        Log.change(player, player.currentPokemon, nextPokemon)
      ),
    };
  };

  let progResult = progress;

  order(progress).forEach(
    (player) => (progResult = change(progResult, player))
  );

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
    if (!progress.winner) {
      const hit = isHit(move);
      progResult =
        move.moveType === "helping"
          ? helping(progResult, isA, move, command, hit)
          : attack(progResult, isA, move, command, hit);
    }
  });

  progResult = passTurnEnvironment(progResult);
  progResult = passTurnCondition(progResult);

  return {
    ...progResult,
    log: Log.add(progResult.log, Log.turnend()),
  };
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
