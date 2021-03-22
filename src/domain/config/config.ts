import { Config as LogConfig } from "@/domain/config/log";
import { Config as PlayerConfig } from "@/domain/config/player";
import { Config as MoveConfig } from "@/domain/config/move";

export type Config = {
  log: LogConfig;
  player: PlayerConfig;
  move: MoveConfig;
};
