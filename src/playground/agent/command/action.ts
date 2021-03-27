import { Player } from "@/domain/model/player";
import {
  currentPokemon,
  getPokemonCandidate,
} from "@/domain/controller/player";
import { ActionCommand } from "@/domain/model/command";
import { read, validIndex } from "@/utils/input";
import { getMoveCandidate } from "@/domain/controller/pokemon";

const initialCommand: ActionCommand | null = null;

const askType = async (): Promise<ActionCommand | null> =>
  await read<ActionCommand | null>(
    "たたかう(fight) or 交換する(change)？ [f/c] >> ",
    (answer) => {
      switch (answer.toLowerCase()) {
        case "f":
          console.log("たたかう！");
          return { type: "fight", index: -1 };
        case "c":
          console.log("交換する！");
          return { type: "change", index: -1 };
        default:
          console.log("もう一度入力してください");
          return initialCommand;
      }
    }
  );

const askMove = async (player: Player): Promise<ActionCommand | null> => {
  const pokemon = currentPokemon(player);
  const moves = getMoveCandidate(pokemon);
  const question = `どの技にする？ ${moves
    .map(
      ({ move, i }) => `[${i + 1}] ${move.name}(${pokemon.pp[i]}/${move.pp})`
    )
    .join(", ")}, [-1] 戻る >> `;

  return await read<ActionCommand | null>(question, (answer) => {
    if (answer === "-1") {
      console.log("戻る");
      return null;
    }
    const index = validIndex(
      moves.map((_, i) => i),
      answer
    );
    if (index !== null) {
      console.log(moves[index].move.name);
      return { type: "fight", index };
    }
    console.log("もう一度入力してください");
    return { type: "fight", index: -1 };
  });
};

const askChange = async (player: Player): Promise<ActionCommand | null> => {
  const pokemons = getPokemonCandidate(player);
  const question = `どのポケモンにする？ ${pokemons
    .map(({ pokemon, i }) => `[${i + 1}] => ${pokemon.name}`)
    .join(", ")}, [-1] 戻る >> `;

  return await read<ActionCommand | null>(question, (answer) => {
    if (answer === "-1") {
      console.log("戻る");
      return null;
    }
    const index = validIndex(
      pokemons.map(({ i }) => i),
      answer
    );
    if (index !== null) {
      console.log(player.pokemons[index].name);
      return { type: "change", index };
    }
    console.log("もう一度入力してください");
    return { type: "change", index: -1 };
  });
};

export const ask = async (player: Player): Promise<ActionCommand> => {
  console.log(`${player.name}の ${currentPokemon(player).name}は どうする？`);

  let command: ActionCommand | null = null;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (command === null) {
      command = await askType();
    } else if (command.type === "fight") {
      command = await askMove(player);
    } else {
      command = await askChange(player);
    }
    if (command && command.index >= 0) {
      return command;
    }
  }
};
