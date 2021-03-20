export type Config = {
  debug: boolean;
  type?: "all" | "hp";
};

export const defaultConfig: Config = {
  debug: false,
};
