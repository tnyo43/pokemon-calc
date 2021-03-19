import { PrepareCommand } from "@/domain/model/battle";
import { Player } from "@/domain/model/player";
import { read, validIndex } from "@/utils/input";

export const ask = async (player: Player): Promise<PrepareCommand> => {
  console.log(`${player.name}さん 次のポケモンを選択してください`);

  const pokemons = player.pokemons
    .map((p, i) => ({ p, i }))
    .filter(({ p, i }) => i !== player.currentPokemon && !p.dying);
  const question = `どのポケモンにする？ ${pokemons
    .map(({ p, i }) => `[${i + 1}] => ${p.name}`)
    .join(", ")} >> `;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const command = await read<PrepareCommand | null>(question, (answer) => {
      const index = validIndex(
        pokemons.map(({ i }) => i),
        answer
      );
      if (index !== null) {
        console.log(player.pokemons[index].name);
        return { index };
      }
      console.log("もう一度入力してください");
      return null;
    });
    if (command) return command;
  }
};
