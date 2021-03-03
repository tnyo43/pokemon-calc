import { StatisticsType } from "@/domain/model/stats";

type CharaStatisticsType = Exclude<StatisticsType, "hp">;

export type Characteristic = {
  up: CharaStatisticsType;
  down: CharaStatisticsType;
} | null;
