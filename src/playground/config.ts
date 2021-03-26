import { Config } from "@/config";
import { apply as applyLog } from "@/domain/controller/log";
import { apply as applyPlayer } from "@/domain/controller/player";
import { apply as applyMove } from "@/domain/controller/move";
import { apply as applyAgent } from "@/playground/agent";

export const apply = (config: Config) => {
  applyLog(config);
  applyPlayer(config);
  applyMove(config);
  applyAgent(config);
};
