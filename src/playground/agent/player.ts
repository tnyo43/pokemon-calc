import { ActionCommand, PrepareCommand, Progress } from "@/domain/model/battle";
import { Agent } from "@/playground/agent/agent";

import * as Action from "@/playground/agent/command/action";
import * as Prepare from "@/playground/agent/command/prepare";

export class Player extends Agent {
  constructor(isA: boolean) {
    super(isA);
  }

  action = async (progress: Progress): Promise<ActionCommand> =>
    await Action.ask(progress[this.playerKey]);

  prepare = async (progress: Progress): Promise<PrepareCommand> =>
    await Prepare.ask(progress[this.playerKey]);
}
