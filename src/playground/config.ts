import { Config } from "@/domain/config/config";
import { apply as applyLog } from "@/domain/controller/log";

export const apply = (config: Config) => {
  applyLog(config);
};
