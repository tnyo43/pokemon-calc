import * as Log from "@/config/log";
import * as Player from "@/config/player";
import * as Move from "@/config/move";
import * as Agent from "@/config/agent";

export type Config = {
  log: Log.Config;
  player: Player.Config;
  move: Move.Config;
  agent: Agent.Config;
};

export const defaultCofig: Config = {
  log: Log.defaultConfig,
  player: Player.defaultConfig,
  move: Move.defaultConfig,
  agent: Agent.defaultConfig,
};
