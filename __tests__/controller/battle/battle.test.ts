import { runAction } from "@/domain/controller/battle/action";
import { passTurn, runPrepare } from "@/domain/controller/battle/turn";
import { apply } from "@/domain/controller/move";
import { currentPokemon } from "@/domain/controller/player";
import { Progress } from "@/domain/model/battle";
import { toString } from "@/domain/model/log";
import { hail, normalEnv, sandstormMisty } from "__tests__/mock/environment";
import { playerA, playerB } from "__tests__/mock/player";
import { kamex, pikachu, rizadon } from "__tests__/mock/pokemon";

describe("battle", () => {
  beforeAll(() => {
    apply({ battle: { hit: "always" } });
  });

  test("すなあらしのダメージとターン経過", () => {
    let progress: Progress = {
      playerA,
      playerB,
      environment: sandstormMisty,
      log: [],
    };

    progress = passTurn(progress);
    expect(currentPokemon(progress.playerA).status.hp).toBe(144);
    expect(currentPokemon(progress.playerB).status.hp).toBe(145);
    expect(progress.environment).toStrictEqual({
      weather: { value: "sandstorm", count: 4 },
      terrain: { value: "misty", count: 4 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "砂あらしが ふきあれる",
      "砂あらしが リザードンを おそう！",
      "砂あらしが カメックスを おそう！",
      "",
    ]);
  });

  test("天候ログでも瀕死になることがある", () => {
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [
          {
            ...rizadon,
            status: {
              ...rizadon.status,
              hp: 1,
            },
          },
          pikachu,
        ],
      },
      playerB,
      environment: hail,
      log: [],
    };
    progress = passTurn(progress);
    expect(progress.log.map(toString)).toStrictEqual([
      "あられが 降りつづけている",
      "あられが リザードンを おそう！",
      "リザードンは たおれた！",
      "あられが カメックスを おそう！",
      "",
    ]);
  });

  test("場のポケモンが戦闘不能になったら次のポケモンを出す", () => {
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [
          {
            ...kamex,
            status: {
              ...kamex.status,
              hp: 32,
            },
          },
          rizadon,
        ],
      },
      playerB: {
        ...playerB,
        pokemons: [pikachu],
      },
      environment: normalEnv,
      log: [],
    };
    progress = runAction(progress, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 2 },
    });
    progress = passTurn(progress);
    progress = runPrepare(progress, {
      playerA: { index: 1 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "ピカチュウの でんこうせっか！",
      "カメックスは 17 ダメージ受けた！",
      "カメックスの なみのり！",
      "ピカチュウは 91 ダメージ受けた！",
      "",
      "satoshiは リザードンを繰り出した！",
      "",
    ]);
  });
});
