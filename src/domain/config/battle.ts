export type Config = {
  accuracy: "normal" | "always" | "none";
};

export const defaultConfig: Config = {
  accuracy: "always",
};
