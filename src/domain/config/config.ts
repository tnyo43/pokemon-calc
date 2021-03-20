import { Config as LogConfig } from "@/domain/config/log";
import { Config as PlayerConfig } from "@/domain/config/player";

export type Config = {
  log: LogConfig;
  player: PlayerConfig;
};
