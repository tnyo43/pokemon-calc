import * as Log from "@/domain/config/log";
import * as Player from "@/domain/config/player";
import * as Move from "@/domain/config/move";

export type Config = {
  log: Log.Config;
  player: Player.Config;
  move: Move.Config;
};

export const defaultCofig: Config = {
  log: Log.defaultConfig,
  player: Player.defaultConfig,
  move: Move.defaultConfig,
};
