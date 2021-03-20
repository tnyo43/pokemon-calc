import { run } from "@/playground/loop";
import { player1, player2 } from "@/domain/data/player";
import { apply } from "@/playground/config";

const main = async () => {
  apply({ log: { debug: true }, player: { debug: true, type: "all" } });
  await run(player1, player2, { weather: "none", terrain: "none" });
};

main();
