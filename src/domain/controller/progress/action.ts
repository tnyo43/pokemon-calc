import { PlayerKey, Progress } from "@/domain/model/progress";
import { ActionCommandSet } from "@/domain/model/command";
import * as Log from "@/domain/controller/log";
import { judge, order } from "@/domain/controller/progress/utils";
import {
  isHit,
  isSideEffectHappen,
  isSuccessMove,
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
import { sortedMoves } from "@/domain/controller/progress";
import { pipe } from "@/utils/pipe";

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
): { progress: Progress; canMove: boolean } => {
  const attacker = progress[attackerKey];
  if (hasAilment(currentPokemon(attacker), "paralysis") && probability(0.25)) {
    return {
      progress: {
        ...progress,
        log: Log.add(
          progress.log,
          Log.cannotMove(currentPokemon(attacker), "paralysis")
        ),
      },
      canMove: false,
    };
  }
  if (hasAilment(currentPokemon(attacker), "freeze")) {
    const canMove = probability(0.25);
    return {
      progress: {
        ...progress,
        [attackerKey]: canMove
          ? updatePokemon(attacker, recoverAilment(currentPokemon(attacker)))
          : progress[attackerKey],
        log: Log.add(
          progress.log,
          canMove
            ? Log.recoverAilment(currentPokemon(attacker), "freeze")
            : Log.cannotMove(currentPokemon(attacker), "freeze")
        ),
      },
      canMove,
    };
  }
  if (hasAilment(currentPokemon(attacker), "sleep")) {
    const nextAttacker = updatePokemon(
      attacker,
      pastSleep(currentPokemon(attacker))
    );
    const canMove = !hasAilment(currentPokemon(nextAttacker), "sleep");
    return {
      progress: {
        ...progress,
        [attackerKey]: nextAttacker,
        log: Log.add(
          progress.log,
          canMove
            ? Log.recoverAilment(currentPokemon(nextAttacker), "sleep")
            : Log.cannotMove(currentPokemon(nextAttacker), "sleep")
        ),
      },
      canMove,
    };
  }
  return {
    progress,
    canMove: true,
  };
};

const updateReducePP = (
  progress: Progress,
  attacker: PlayerKey,
  command: ActionCommandSet,
  move: Move
) => ({
  ...progress,
  [attacker]: updatePokemon(
    progress[attacker],
    reducePP(currentPokemon(progress[attacker]), command[attacker].index, 1)
  ),
  log: Log.add(
    progress.log,
    Log.action(currentPokemon(progress[attacker]), move)
  ),
});

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

  return pipe(progress)((progress) => {
    return cannotMoveByAilment(progress, playerKeys.attacker);
  })(({ progress, canMove }) =>
    canMove
      ? {
          progress: updateReducePP(
            progress,
            playerKeys.attacker,
            command,
            move
          ),
          canContinue: canMove,
        }
      : { progress, canContinue: canMove }
  )(({ progress, canContinue }) => {
    const args: Args = {
      attacker: progress[playerKeys.attacker],
      defencer: progress[playerKeys.defencer],
      keys: playerKeys,
    };
    return canContinue
      ? !isSuccessMove(
          move,
          currentPokemon(args.attacker),
          progress.environment
        )
        ? {
            ...progress,
            log: Log.add(progress.log, Log.failed()),
          }
        : !isHit(move)
        ? {
            ...progress,
            log: Log.add(
              progress.log,
              Log.miss(currentPokemon(progress[playerKeys.defencer]))
            ),
          }
        : move.moveType === "helping"
        ? helping(progress, args, move)
        : attack(progress, args, move)
      : progress;
  })();
};

export const runAction = (
  progress: Progress,
  command: ActionCommandSet
): Progress => {
  if (progress.winner) return progress;
  const moves = sortedMoves(progress, command);

  return pipe(progress)((p) => {
    return changePokemon(p, command);
  })((progress) =>
    moves.reduce((p, { move, isA }) => action(p, move, isA, command), progress)
  )();
};
