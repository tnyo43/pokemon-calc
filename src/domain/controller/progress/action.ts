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
  playerKeys: { attacker: PlayerKey; defencer: PlayerKey },
  move: AttackMove
): Progress => {
  if (progress.winner || needToChange(progress[playerKeys.attacker]))
    return progress;

  if (currentPokemon(progress[playerKeys.defencer]).condition.protect) {
    return {
      ...progress,
      log: Log.add(
        progress.log,
        Log.protectSucceed(currentPokemon(progress[playerKeys.defencer]))
      ),
    };
  }

  return pipe(progress)((progress) => {
    const damageResult = damage(
      move,
      currentPokemon(progress[playerKeys.attacker]),
      currentPokemon(progress[playerKeys.defencer]),
      progress.environment
    );
    const damagedDefencer = updatePokemon(
      progress[playerKeys.defencer],
      beHurt(currentPokemon(progress[playerKeys.defencer]), damageResult)
    );
    return judge(
      {
        ...progress,
        [playerKeys.defencer]: damagedDefencer,
        log: Log.add(
          progress.log,
          Log.damage(currentPokemon(damagedDefencer), damageResult)
        ),
      },
      playerKeys.defencer
    );
  })((progress) => ({
    progress,
    continuing: !currentPokemon(progress[playerKeys.defencer]).dying,
  }))(({ progress, continuing }) => {
    if (!continuing) return progress;
    if (
      move.sideEffect &&
      isSideEffectHappen(move) &&
      move.sideEffect.ailment &&
      mayBeAffected(
        move.sideEffect.ailment.label,
        currentPokemon(progress[playerKeys.defencer]),
        progress.environment
      )
    ) {
      return {
        ...progress,
        [playerKeys.defencer]: updatePokemon(
          progress[playerKeys.defencer],
          addAilment(
            currentPokemon(progress[playerKeys.defencer]),
            move.sideEffect.ailment.label
          )
        ),
        log: Log.add(
          progress.log,
          Log.ailment(
            currentPokemon(progress[playerKeys.defencer]),
            move.sideEffect.ailment.label
          )
        ),
      };
    }
    return progress;
  })((progress) => judge(progress, playerKeys.attacker))();
};

const helping = (
  progress: Progress,
  playerKeys: { attacker: PlayerKey; defencer: PlayerKey },
  move: HelpingMove
): Progress => {
  if (progress.winner || needToChange(progress[playerKeys.attacker]))
    return progress;

  if (
    currentPokemon(progress[playerKeys.defencer]).condition.protect &&
    (move.statusDiff?.opponent || move.ailment)
  ) {
    return {
      ...progress,
      log: Log.add(
        progress.log,
        Log.protectSucceed(currentPokemon(progress[playerKeys.defencer]))
      ),
    };
  }

  return pipe(progress)((progress) =>
    move.statusDiff?.own
      ? {
          ...progress,
          [playerKeys.attacker]: updatePokemon(
            progress[playerKeys.attacker],
            updateStatus(
              currentPokemon(progress[playerKeys.attacker]),
              convertStatus(
                currentPokemon(progress[playerKeys.attacker]),
                move.statusDiff.own
              )
            )
          ),
          log: Log.add(
            progress.log,
            Log.status(
              currentPokemon(progress[playerKeys.attacker]),
              convertStatus(
                currentPokemon(progress[playerKeys.attacker]),
                move.statusDiff.own
              )
            )
          ),
        }
      : progress
  )((progress) =>
    move.protect
      ? {
          ...progress,
          [playerKeys.attacker]: updatePokemon(progress[playerKeys.attacker], {
            ...currentPokemon(progress[playerKeys.attacker]),
            condition: {
              ...currentPokemon(progress[playerKeys.attacker]).condition,
              protect: true,
            },
          }),
          log: Log.add(
            progress.log,
            Log.protect(currentPokemon(progress[playerKeys.attacker]))
          ),
        }
      : progress
  )((progress) =>
    move.statusDiff?.opponent
      ? {
          ...progress,
          [playerKeys.defencer]: updatePokemon(
            progress[playerKeys.defencer],
            updateStatus(
              currentPokemon(progress[playerKeys.defencer]),
              convertStatus(
                currentPokemon(progress[playerKeys.defencer]),
                move.statusDiff.opponent
              )
            )
          ),
          log: Log.add(
            progress.log,
            Log.status(
              currentPokemon(progress[playerKeys.defencer]),
              convertStatus(
                currentPokemon(progress[playerKeys.defencer]),
                move.statusDiff.opponent
              )
            )
          ),
        }
      : progress
  )((progress) =>
    !move.ailment
      ? progress
      : !hasAilment(currentPokemon(progress[playerKeys.defencer])) &&
        mayBeAffected(
          move.ailment,
          currentPokemon(progress[playerKeys.defencer]),
          progress.environment
        )
      ? {
          ...progress,
          [playerKeys.defencer]: updatePokemon(
            progress[playerKeys.defencer],
            addAilment(
              currentPokemon(progress[playerKeys.defencer]),
              move.ailment
            )
          ),
          log: Log.add(
            progress.log,
            Log.ailment(
              currentPokemon(progress[playerKeys.defencer]),
              move.ailment
            )
          ),
        }
      : { ...progress, log: Log.add(progress.log, Log.failed()) }
  )();
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
  const playerKeys: { attacker: PlayerKey; defencer: PlayerKey } = isA
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
          continuing: canMove,
        }
      : { progress, continuing: canMove }
  )(({ progress, continuing }) => {
    return continuing
      ? !isSuccessMove(
          move,
          currentPokemon(progress[playerKeys.attacker]),
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
        ? helping(progress, playerKeys, move)
        : attack(progress, playerKeys, move)
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
