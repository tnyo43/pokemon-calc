import { Environment } from "@/domain/model/environment";
import { Log } from "@/domain/model/log";
import { Player } from "@/domain/model/player";

export type ActionCommand = { type: "fight" | "change"; index: number };

export type ActionCommandSet = {
  playerA: ActionCommand;
  playerB: ActionCommand;
};

export type PrepareCommand = { index: number };

export type PrepareCommandSet = {
  playerA?: PrepareCommand;
  playerB?: PrepareCommand;
};

export type Progress = {
  playerA: Player;
  playerB: Player;
  environment: Environment;
  log: Log[];
  winner?: "playerA" | "playerB";
};

export type PlayerKey = "playerA" | "playerB";
