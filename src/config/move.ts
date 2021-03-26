export type Config = {
  hit: "probability" | "always" | "none";
  sideEffect: "probability" | "always" | "none";
};

export const defaultConfig: Config = {
  hit: "probability",
  sideEffect: "probability",
};
