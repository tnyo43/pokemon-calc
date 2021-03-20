export type StatisticsType =
  | "hp"
  | "attack"
  | "defence"
  | "specialAttack"
  | "specialDefence"
  | "speed";

type StatusType = StatisticsType | "evasion" | "accuracy";

export type Statistics = {
  [key in StatisticsType]: number;
};

export type Status = {
  [key in StatusType]: number;
} & {
  pp: number[];
};
