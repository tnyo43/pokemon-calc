import { ActionCommand, ActionCommandSet } from "@/domain/model/command";
import { Move } from "@/domain/model/move";
import { Player } from "@/domain/model/player";
import { priority } from "@/domain/controller/move";
import { speed as getSpeed } from "@/domain/controller/pokemon";
import { currentPokemon } from "@/domain/controller/player";

type MoveElement = { move: Move; isA: boolean; speed: number };

export const sortedMoves = (
  { playerA, playerB }: { playerA: Player; playerB: Player },
  command: ActionCommandSet
): Omit<MoveElement, "speed">[] => {
  const priorityRatio = 1000;

  const getMove = (
    player: Player,
    isA: boolean,
    command: ActionCommand
  ): MoveElement | undefined => {
    if (command.type !== "fight") return undefined;
    const pokemon = currentPokemon(player);
    const move = pokemon.moves[command.index];

    // 同速の時はランダムで決める
    const speed =
      priority(move) * priorityRatio + getSpeed(pokemon) + Math.random();
    return { move, isA, speed };
  };

  const moves = [
    getMove(playerA, true, command.playerA),
    getMove(playerB, false, command.playerB),
  ];

  return moves
    .filter(
      (move): move is Exclude<MoveElement, undefined> => move !== undefined
    )
    .sort((m1, m2) => m2.speed - m1.speed);
};
