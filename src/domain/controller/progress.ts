import { Progress } from "@/domain/model/progress";
import { ActionCommandSet } from "@/domain/model/command";
import { Move } from "@/domain/model/move";
import { Player } from "@/domain/model/player";
import { priority } from "@/domain/controller/move";
import { speed as getSpeed } from "@/domain/controller/pokemon";
import { currentPokemon } from "@/domain/controller/player";

type MoveElement = { move: Move; isA: boolean; speed: number };

export const sortedMoves = (
  progress: Progress,
  command: ActionCommandSet
): Omit<MoveElement, "speed">[] => {
  const priorityRatio = 1000;

  const addMove = (
    moves: MoveElement[],
    player: Player,
    isA: boolean,
    index: number
  ): MoveElement[] => {
    const pokemon = currentPokemon(player);
    const move = pokemon.moves[index];

    // for random iff some are same speed and priority
    const speed =
      priority(move) * priorityRatio + getSpeed(pokemon) + Math.random();
    return moves.concat({ move, isA, speed });
  };

  let moves: MoveElement[] = [];
  if (command.playerA.type === "fight")
    moves = addMove(moves, progress.playerA, true, command.playerA.index);
  if (command.playerB.type === "fight")
    moves = addMove(moves, progress.playerB, false, command.playerB.index);

  return moves.sort((m1, m2) => m2.speed - m1.speed);
};
