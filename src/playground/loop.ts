import { PrepareCommandSet, Progress } from "@/domain/model/battle";
import { Environment } from "@/domain/model/environment";
import { Player } from "@/domain/model/player";
import * as Action from "@/playground/command/action";
import * as Prepare from "@/playground/command/prepare";
import { runAction, runPrepare } from "@/domain/controller/battle";
import { needToChange } from "@/domain/controller/player";

export const run = async (
  playerA: Player,
  playerB: Player,
  environment: Environment
) => {
  let progress: Progress = {
    playerA,
    playerB,
    environment,
    log: [],
  };

  while (!progress.winner) {
    const commandA = await Action.ask(progress.playerA);
    const commandB = await Action.ask(progress.playerB);
    progress = runAction(progress, { playerA: commandA, playerB: commandB });
    if (progress.winner) break;

    let pCommand: PrepareCommandSet = {};
    if (needToChange(progress.playerA))
      pCommand = { ...pCommand, playerA: await Prepare.ask(progress.playerA) };
    if (needToChange(progress.playerB))
      pCommand = { ...pCommand, playerB: await Prepare.ask(progress.playerB) };
    progress = runPrepare(progress, pCommand);
  }

  console.log(`${progress[progress.winner].name}の 勝ち！`);
};
