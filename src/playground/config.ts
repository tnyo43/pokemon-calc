import { Config } from "@/domain/config/config";
import { apply as applyLog } from "@/domain/controller/log";
import { apply as applyPlayer } from "@/domain/controller/player";

export const apply = (config: Config) => {
  applyLog(config);
  applyPlayer(config);
};
