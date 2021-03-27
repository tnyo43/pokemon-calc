export type ActionCommand = { type: "fight" | "change"; index: number };

export type ActionCommandSet = {
  playerA: ActionCommand;
  playerB: ActionCommand;
};

export type PrepareCommand = { index: number };

export type PrepareCommandSet = {
  playerA?: PrepareCommand;
  playerB?: PrepareCommand;
};
