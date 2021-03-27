import { ActionCommand, PrepareCommand } from "@/domain/model/command";
import { PlayerKey, Progress } from "@/domain/model/progress";

export abstract class Agent {
  playerKey: PlayerKey;

  constructor(isA: boolean) {
    this.playerKey = isA ? "playerA" : "playerB";
  }

  abstract action: (progress: Progress) => Promise<ActionCommand>;
  abstract prepare: (progress: Progress) => Promise<PrepareCommand>;
}
