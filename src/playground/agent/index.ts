import { Config, defaultConfig } from "@/config/agent";
import { Player } from "@/playground/agent/player";

let config = defaultConfig;

export const apply = ({ agent }: { agent: Config }) => {
  config = agent;
};

const getConfig = () => config;

const agentOf = (isA: boolean): Player => {
  const agentType = getConfig()[isA ? "playerA" : "playerB"];
  switch (agentType) {
    case "player":
      return new Player(isA);
  }
};

export const getAgent = () => ({
  playerA: agentOf(true),
  playerB: agentOf(false),
});
