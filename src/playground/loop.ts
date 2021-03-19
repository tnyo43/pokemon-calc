import { Progress } from "@/domain/model/battle";
import { Environment } from "@/domain/model/environment";
import { Player } from "@/domain/model/player";
import { ask } from "@/playground/command";
import { run as runCommand } from "@/domain/controller/battle";

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
    const commandA = await ask(progress.playerA);
    const commandB = await ask(progress.playerB);
    progress = runCommand(progress, { playerA: commandA, playerB: commandB });
  }

  console.log(`${progress[progress.winner].name}の 勝ち！`);
};
