import { Environment } from "@/domain/model/environment";
import { Log } from "@/domain/model/log";
import { Player } from "@/domain/model/player";

export type Command = { type: "fight" | "change"; index: number };

export type Commands = {
  playerA: Command;
  playerB: Command;
};

export type Progress = {
  playerA: Player;
  playerB: Player;
  environment: Environment;
  log: Log[];
  winner?: "A" | "B";
};
