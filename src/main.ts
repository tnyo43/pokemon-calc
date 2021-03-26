import { run } from "@/playground/loop";
import { player1, player2 } from "@/domain/data/player";
import { apply } from "@/playground/config";
import { defaultCofig } from "@/config";

const main = async () => {
  apply(defaultCofig);
  await run(player1, player2, { weather: "none", terrain: "none" });
};

main();
