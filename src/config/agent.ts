export type AgentType = "player";

export type Config = {
  playerA: AgentType;
  playerB: AgentType;
};

export const defaultConfig: Config = {
  playerA: "player",
  playerB: "player",
};
