import { ActionCommandSet, PlayerKey, Progress } from "@/domain/model/battle";
import * as Log from "@/domain/controller/log";
import { judge, order } from "@/domain/controller/battle/utils";
import {
  isHit,
  isSideEffectHappen,
  isSuccessMove,
  sortedMoves,
} from "@/domain/controller/move";
import { AttackMove, HelpingMove, Move } from "@/domain/model/move";
import {
  currentPokemon,
  needToChange,
  updatePokemon,
} from "@/domain/controller/player";
import {
  beHurt,
  convertStatus,
  damage,
  reducePP,
  updateStatus,
} from "@/domain/controller/pokemon";
import { Player } from "@/domain/model/player";
import { probability } from "@/utils/random";
import {
  addAilment,
  hasAilment,
  mayBeAffected,
  pastSleep,
  recoverAilment,
} from "@/domain/controller/ailment";

type Args = {
  attacker: Player;
  defencer: Player;
  keys: {
    attacker: PlayerKey;
    defencer: PlayerKey;
  };
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

const attack = (
  progress: Progress,
  { attacker, defencer, keys }: Args,
  move: AttackMove
): Progress => {
  if (progress.winner || needToChange(attacker)) return progress;

  if (currentPokemon(defencer).condition.protect) {
    return {
      ...progress,
      log: Log.add(progress.log, Log.protectSucceed(currentPokemon(defencer))),
    };
  }

  let log = progress.log;
  const damageResult = damage(
    move,
    currentPokemon(attacker),
    currentPokemon(defencer),
    progress.environment
  );
  defencer = updatePokemon(
    defencer,
    beHurt(currentPokemon(defencer), damageResult)
  );
  log = Log.add(log, Log.damage(currentPokemon(defencer), damageResult));

  let progResult = judge(
    {
      ...progress,
      log,
      [keys.defencer]: defencer,
    },
    keys.defencer
  );

  defencer = progResult[keys.defencer];
  log = progResult.log;

  if (currentPokemon(defencer).dying) return progResult;

  if (move.sideEffect && isSideEffectHappen(move)) {
    if (move.sideEffect.ailment) {
      const { label } = move.sideEffect.ailment;
      if (
        mayBeAffected(label, currentPokemon(defencer), progress.environment)
      ) {
        defencer = updatePokemon(
          defencer,
          addAilment(currentPokemon(defencer), label)
        );
        log = Log.add(log, Log.ailment(currentPokemon(defencer), label));
      }
    }
  }

  progResult = {
    ...progResult,
    log,
    [keys.attacker]: attacker,
    [keys.defencer]: defencer,
  };

  progResult = judge(progResult, keys.attacker);
  return progResult;
};

const helping = (
  progress: Progress,
  { attacker, defencer, keys }: Args,
  move: HelpingMove
) => {
  if (progress.winner || needToChange(attacker)) return progress;

  if (
    currentPokemon(defencer).condition.protect &&
    (move.statusDiff?.opponent || move.ailment)
  ) {
    return {
      ...progress,
      log: Log.add(progress.log, Log.protectSucceed(currentPokemon(defencer))),
    };
  }

  let log = progress.log;
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
  } else if (move.statusDiff?.opponent) {
    log = Log.add(
      log,
      Log.status(
        currentPokemon(defencer),
        convertStatus(currentPokemon(defencer), move.statusDiff?.opponent)
      )
    );
  }
  if (move.ailment) {
    if (
      !hasAilment(currentPokemon(defencer)) &&
      mayBeAffected(
        move.ailment,
        currentPokemon(defencer),
        progress.environment
      )
    ) {
      log = Log.add(log, Log.ailment(currentPokemon(defencer), move.ailment));
      defencer = updatePokemon(
        defencer,
        addAilment(currentPokemon(defencer), move.ailment)
      );
    } else {
      log = Log.add(log, Log.failed());
    }
  }

  return {
    ...progress,
    [keys.attacker]: updatePokemon(
      attacker,
      updateStatus(
        currentPokemon(attacker),
        move.statusDiff?.own ? move.statusDiff?.own : {}
      )
    ),
    [keys.defencer]: updatePokemon(
      defencer,
      updateStatus(
        currentPokemon(defencer),
        move.statusDiff?.opponent ? move.statusDiff?.opponent : {}
      )
    ),
    log,
  };
};

const cannotMoveByAilment = (
  progress: Progress,
  attackerKey: PlayerKey
): [Progress, boolean] => {
  let attacker = progress[attackerKey];
  let log = progress.log;
  if (hasAilment(currentPokemon(attacker), "paralysis") && probability(0.25)) {
    return [
      {
        ...progress,
        log: Log.add(
          progress.log,
          Log.cannotMove(currentPokemon(attacker), "paralysis")
        ),
      },
      false,
    ];
  }
  if (hasAilment(currentPokemon(attacker), "freeze")) {
    if (probability(0.75)) {
      return [
        {
          ...progress,
          log: Log.add(
            progress.log,
            Log.cannotMove(currentPokemon(attacker), "freeze")
          ),
        },
        false,
      ];
    } else {
      attacker = updatePokemon(
        attacker,
        recoverAilment(currentPokemon(attacker))
      );
      log = Log.add(
        progress.log,
        Log.recoverAilment(currentPokemon(attacker), "freeze")
      );
    }
  }
  if (hasAilment(currentPokemon(attacker), "sleep")) {
    attacker = updatePokemon(attacker, pastSleep(currentPokemon(attacker)));
    if (hasAilment(currentPokemon(attacker), "sleep")) {
      return [
        {
          ...progress,
          [attackerKey]: attacker,
          log: Log.add(
            progress.log,
            Log.cannotMove(currentPokemon(attacker), "sleep")
          ),
        },
        false,
      ];
    } else {
      log = Log.add(
        progress.log,
        Log.recoverAilment(currentPokemon(attacker), "sleep")
      );
    }
  }
  return [
    {
      ...progress,
      [attackerKey]: attacker,
      log,
    },
    true,
  ];
};

const action = (
  progress: Progress,
  move: Move,
  isA: boolean,
  command: ActionCommandSet
) => {
  const playerKeys: Args["keys"] = isA
    ? { attacker: "playerA", defencer: "playerB" }
    : { attacker: "playerB", defencer: "playerA" };

  if (progress.winner || needToChange(progress[playerKeys.attacker]))
    return progress;

  const [progResult, canContinue] = cannotMoveByAilment(
    progress,
    playerKeys.attacker
  );
  if (!canContinue) return progResult;
  progress = progResult;

  const args: Args = {
    attacker: progress[isA ? "playerA" : "playerB"],
    defencer: progress[!isA ? "playerA" : "playerB"],
    keys: playerKeys,
  };

  args.attacker = updatePokemon(
    args.attacker,
    reducePP(
      currentPokemon(args.attacker),
      command[args.keys.attacker].index,
      1
    )
  );

  progress = {
    ...progress,
    log: Log.add(progress.log, Log.action(currentPokemon(args.attacker), move)),
  };

  if (
    !isSuccessMove(move, currentPokemon(args.attacker), progress.environment)
  ) {
    progress = {
      ...progress,
      log: Log.add(progress.log, Log.failed()),
    };
  } else if (!isHit(move)) {
    progress = {
      ...progress,
      log: Log.add(progress.log, Log.miss(currentPokemon(args.defencer))),
    };
  } else {
    progress =
      move.moveType === "helping"
        ? helping(progress, args, move)
        : attack(progress, args, move);
  }

  return progress;
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
    progResult = action(progResult, move, isA, command);
  });

  return progResult;
};
