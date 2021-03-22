export type Config = {
  hit: "probability" | "always" | "none";
};

export const defaultConfig: Config = {
  hit: "always",
};
