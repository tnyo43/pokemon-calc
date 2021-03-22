import { ActionCommandSet, PlayerKey, Progress } from "@/domain/model/battle";
import * as Log from "@/domain/controller/log";
import { judge, order } from "@/domain/controller/battle/utils";
import { isHit, sortedMoves } from "@/domain/controller/move";
import { AttackMove, HelpingMove, Move } from "@/domain/model/move";
import {
  currentPokemon,
  needToChange,
  updatePokemon,
} from "@/domain/controller/player";
import {
  addAilment,
  beHurt,
  convertStatus,
  damage,
  hasAilment,
  reducePP,
  updateStatus,
} from "@/domain/controller/pokemon";
import { Player } from "@/domain/model/player";
import { probability } from "@/utils/random";

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
  const { environment } = progress;

  if (progress.winner || needToChange(attacker)) return progress;

  let log = progress.log;

  if (currentPokemon(defencer).condition.protect) {
    log = Log.add(log, Log.protectSucceed(currentPokemon(defencer)));
  } else {
    const damageResult = damage(
      move,
      currentPokemon(attacker),
      currentPokemon(defencer),
      environment
    );
    defencer = updatePokemon(
      defencer,
      beHurt(currentPokemon(defencer), damageResult)
    );
    log = Log.add(log, Log.damage(currentPokemon(defencer), damageResult));
  }

  let progressResult = {
    ...progress,
    log,
    [keys.attacker]: attacker,
    [keys.defencer]: defencer,
  };

  progressResult = judge(progressResult, keys.defencer);
  progressResult = judge(progressResult, keys.attacker);
  return progressResult;
};

const helping = (
  progress: Progress,
  { attacker, defencer, keys }: Args,
  move: HelpingMove
) => {
  if (progress.winner || needToChange(attacker)) return progress;

  let log = progress.log;

  if (
    currentPokemon(defencer).condition.protect &&
    (move.statusDiff?.opponent || move.ailment)
  ) {
    log = Log.add(log, Log.protectSucceed(currentPokemon(defencer)));
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
    } else if (move.statusDiff?.opponent) {
      log = Log.add(
        log,
        Log.status(
          currentPokemon(defencer),
          convertStatus(currentPokemon(defencer), move.statusDiff?.opponent)
        )
      );
    }
    if (move.ailment && hasAilment(currentPokemon(attacker))) {
      log = Log.add(log, Log.ailment(currentPokemon(defencer), move.ailment));
      defencer = updatePokemon(
        defencer,
        addAilment(currentPokemon(defencer), move.ailment)
      );
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

const action = (
  progress: Progress,
  move: Move,
  isA: boolean,
  command: ActionCommandSet
) => {
  const args: Args = {
    attacker: progress[isA ? "playerA" : "playerB"],
    defencer: progress[!isA ? "playerA" : "playerB"],
    keys: isA
      ? { attacker: "playerA", defencer: "playerB" }
      : { attacker: "playerB", defencer: "playerA" },
  };

  if (progress.winner || needToChange(args.attacker)) return progress;

  if (
    hasAilment(currentPokemon(args.attacker), "paralysis") &&
    probability(0.25)
  ) {
    return {
      ...progress,
      log: Log.add(
        progress.log,
        Log.cannotMove(currentPokemon(args.attacker), "paralysis")
      ),
    };
  }

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

  if (!isHit(move)) {
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
