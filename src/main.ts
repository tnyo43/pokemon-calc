import { run } from "@/playground/loop";
import { player1, player2 } from "@/domain/data/player";

const main = async () =>
  await run(player1, player2, { weather: "none", terrain: "none" });

main();
