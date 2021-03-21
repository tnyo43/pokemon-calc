export type StatisticsType =
  | "hp"
  | "attack"
  | "defence"
  | "specialAttack"
  | "specialDefence"
  | "speed";

export type StatusType = StatisticsType | "evasion" | "accuracy";

export type Statistics = {
  [key in StatisticsType]: number;
};

export type Status = {
  [key in StatusType]: number;
};

export type Condition = {
  protect?: boolean;
};

export const toString = (status: StatusType) => {
  switch (status) {
    case "hp":
      return "体力";
    case "attack":
      return "攻撃";
    case "defence":
      return "防御";
    case "specialAttack":
      return "特攻";
    case "specialDefence":
      return "特防";
    case "speed":
      return "素早さ";
    case "evasion":
      return "回避率";
    case "accuracy":
      return "命中";
  }
};
