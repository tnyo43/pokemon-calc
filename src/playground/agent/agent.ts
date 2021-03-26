import {
  ActionCommand,
  PlayerKey,
  PrepareCommand,
  Progress,
} from "@/domain/model/battle";

export abstract class Agent {
  playerKey: PlayerKey;

  constructor(isA: boolean) {
    this.playerKey = isA ? "playerA" : "playerB";
  }

  abstract action: (progress: Progress) => Promise<ActionCommand>;
  abstract prepare: (progress: Progress) => Promise<PrepareCommand>;
}
