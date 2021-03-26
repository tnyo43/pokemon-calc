import { Progress } from "@/domain/model/battle";
import { Environment } from "@/domain/model/environment";
import { Player } from "@/domain/model/player";
import { display as displayPlayer } from "@/domain/controller/player";
import { passTurn, runPrepare } from "@/domain/controller/battle/turn";
import { needToChange } from "@/domain/controller/player";
import { runAction } from "@/domain/controller/battle/action";
import { getAgent } from "@/playground/agent";

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

  const agents = getAgent();

  while (!progress.winner) {
    displayPlayer(progress.playerA);
    displayPlayer(progress.playerB);

    progress = runAction(progress, {
      playerA: await agents.playerA.action(progress),
      playerB: await agents.playerB.action(progress),
    });
    if (progress.winner) break;

    progress = passTurn(progress);

    progress = runPrepare(progress, {
      playerA: needToChange(progress.playerA)
        ? await agents.playerA.prepare(progress)
        : undefined,
      playerB: needToChange(progress.playerB)
        ? await agents.playerB.prepare(progress)
        : undefined,
    });
  }

  console.log(`${progress[progress.winner].name}の 勝ち！`);
};
