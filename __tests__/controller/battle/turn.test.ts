import { runAction } from "@/domain/controller/battle/action";
import { passTurn, runPrepare } from "@/domain/controller/battle/turn";
import { apply } from "@/domain/controller/move";
import { currentPokemon } from "@/domain/controller/player";
import { addAilment } from "@/domain/controller/ailment";
import { Progress } from "@/domain/model/battle";
import { toString } from "@/domain/model/log";
import { hail, normalEnv, sandstormMisty } from "__tests__/mock/environment";
import { player, playerA, playerB } from "__tests__/mock/player";
import {
  damagedPokemon,
  kamex,
  pikachu,
  rizadon,
} from "__tests__/mock/pokemon";

describe("battle/turn", () => {
  beforeAll(() => {
    apply({ battle: { hit: "always", sideEffect: "probability" } });
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
      playerA: player([damagedPokemon(rizadon, 1), pikachu]),
      playerB,
      environment: hail,
      log: [],
    };
    progress = passTurn(progress);
    progress = runPrepare(progress, {
      playerA: { index: 1 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "あられが 降りつづけている",
      "あられが リザードンを おそう！",
      "リザードンは たおれた！",
      "あられが カメックスを おそう！",
      "",
      "satoshiは ピカチュウを繰り出した！",
      "",
    ]);
  });

  test("場のポケモンが戦闘不能になったら次のポケモンを出す", () => {
    let progress: Progress = {
      playerA,
      playerB: player([damagedPokemon(kamex, 1), rizadon], "shigeru"),
      environment: normalEnv,
      log: [],
    };
    progress = runAction(progress, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 0 },
    });
    progress = passTurn(progress);
    progress = runPrepare(progress, {
      playerB: { index: 1 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "リザードンの かえんしょうしゃ！",
      "カメックスは 31 ダメージ受けた！",
      "カメックスは たおれた！",
      "",
      "shigeruは リザードンを繰り出した！",
      "",
    ]);
  });

  test("一方の出せるポケモンがいなくなったらおしまい", () => {
    let progress: Progress = {
      playerA,
      playerB: player([damagedPokemon(kamex, 1)], "shigeru"),
      environment: normalEnv,
      log: [],
    };
    progress = runAction(progress, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "リザードンの かえんしょうしゃ！",
      "カメックスは 31 ダメージ受けた！",
      "カメックスは たおれた！",
      "shigeruとの 勝負に 勝った！",
    ]);
  });

  test("やけどと毒になると継続的にダメージを受ける", () => {
    let progress: Progress = {
      playerA: player([addAilment(pikachu, "poison")]),
      playerB: player([addAilment(kamex, "burn")]),
      environment: normalEnv,
      log: [],
    };
    progress = passTurn(progress);
    expect(currentPokemon(progress.playerA).status.hp).toBe(
      pikachu.basicValue.hp - Math.floor(pikachu.basicValue.hp / 8)
    );
    expect(currentPokemon(progress.playerB).status.hp).toBe(
      kamex.basicValue.hp - Math.floor(kamex.basicValue.hp / 16)
    );
    expect(progress.log.map(toString)).toStrictEqual([
      "ピカチュウは 毒の ダメージを受けた！",
      "カメックスは やけどの ダメージを受けた！",
      "",
    ]);
  });

  test("もうどくになるとダメージも増える", () => {
    let progress: Progress = {
      playerA: player([addAilment(pikachu, "bad poison")]),
      playerB,
      environment: normalEnv,
      log: [],
    };
    const maxHp = pikachu.basicValue.hp;
    let expectedHp = pikachu.basicValue.hp;
    progress = passTurn(progress);
    expectedHp -= Math.floor(maxHp / 16);
    expect(currentPokemon(progress.playerA).status.hp).toBe(expectedHp);
    progress = passTurn(progress);
    expectedHp -= Math.floor((maxHp * 2) / 16);
    expect(currentPokemon(progress.playerA).status.hp).toBe(expectedHp);
    progress = passTurn(progress);
    expectedHp -= Math.floor((maxHp * 3) / 16);
    expect(currentPokemon(progress.playerA).status.hp).toBe(expectedHp);
    progress = passTurn(progress);
    expectedHp -= Math.floor((maxHp * 4) / 16);
    expect(currentPokemon(progress.playerA).status.hp).toBe(expectedHp);
    expect(progress.log.map(toString)).toStrictEqual([
      "ピカチュウは 毒の ダメージを受けた！",
      "",
      "ピカチュウは 毒の ダメージを受けた！",
      "",
      "ピカチュウは 毒の ダメージを受けた！",
      "",
      "ピカチュウは 毒の ダメージを受けた！",
      "",
    ]);
  });
});
