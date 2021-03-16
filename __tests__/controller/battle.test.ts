import { run } from "@/domain/controller/battle";
import { Command, Progress } from "@/domain/model/battle";
import { toString } from "@/domain/model/log";
import {
  hail,
  normalEnv,
  sandstormMisty,
  sunlight,
} from "__tests__/mock/environment";
import { kamex, pikachu, rizadon, weavile } from "__tests__/mock/pokemon";

describe("battle", () => {
  test("天候なし、通常の攻撃のやりとり", () => {
    const progress: Progress = {
      pokemonA: rizadon,
      pokemonB: kamex,
      environment: normalEnv,
      log: [],
    };
    const command: Command = {
      playerA: 0,
      playerB: 0,
    };

    const result = run(progress, command);
    expect(result.pokemonA.status.hp).toBe(31);
    expect(result.pokemonB.status.hp).toBe(123);
    expect(result.environment).toStrictEqual(normalEnv);
    expect(result.log.map(toString)).toStrictEqual([
      "リザードンの かえんしょうしゃ！",
      "カメックスは 31 ダメージ受けた！",
      "カメックスの なみのり！",
      "リザードンは 122 ダメージ受けた！",
    ]);
  });

  test("はれ", () => {
    const progress: Progress = {
      pokemonA: rizadon,
      pokemonB: kamex,
      environment: sunlight,
      log: [],
    };
    const command: Command = {
      playerA: 0,
      playerB: 0,
    };

    const result = run(progress, command);
    expect(result.environment.weather).toStrictEqual({
      value: "sunlight",
      count: 4,
    });
    expect(result.log.map(toString)).toStrictEqual([
      "リザードンの かえんしょうしゃ！",
      "カメックスは 47 ダメージ受けた！",
      "カメックスの なみのり！",
      "リザードンは 60 ダメージ受けた！",
      "日差しが 強い",
    ]);
  });

  test("すなあらしのダメージとターン経過", () => {
    const progress: Progress = {
      pokemonA: rizadon,
      pokemonB: kamex,
      environment: sandstormMisty,
      log: [],
    };
    const command: Command = {
      playerA: 0,
      playerB: 0,
    };

    const result = run(progress, command);
    expect(result.pokemonA.status.hp).toBe(22);
    expect(result.pokemonB.status.hp).toBe(114);
    expect(result.environment).toStrictEqual({
      weather: { value: "sandstorm", count: 4 },
      terrain: { value: "misty", count: 4 },
    });
    expect(result.log.map(toString)).toStrictEqual([
      "リザードンの かえんしょうしゃ！",
      "カメックスは 31 ダメージ受けた！",
      "カメックスの なみのり！",
      "リザードンは 122 ダメージ受けた！",
      "砂あらしが ふきあれる",
      "砂あらしが リザードンを おそう！",
      "砂あらしが カメックスを おそう！",
    ]);
  });

  test("優先度+1のわざが先に出る", () => {
    let progress: Progress = {
      pokemonA: pikachu,
      pokemonB: weavile,
      environment: normalEnv,
      log: [],
    };
    progress = run(progress, {
      playerA: 2,
      playerB: 0,
    });
    progress = run(progress, {
      playerA: 2,
      playerB: 1,
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "ピカチュウの でんこうせっか！",
      "マニューラは 24 ダメージ受けた！",
      "マニューラの あくのはどう！",
      "ピカチュウは 46 ダメージ受けた！",
      "マニューラの こおりのつぶて！",
      "ピカチュウは 78 ダメージ受けた！",
      "ピカチュウは たおれた！",
    ]);
  });

  test("残りHPが0になると戦闘不能になる", () => {
    let progress: Progress = {
      pokemonA: kamex,
      pokemonB: rizadon,
      environment: normalEnv,
      log: [],
    };
    progress = run(progress, {
      playerA: 0,
      playerB: 0,
    });
    progress = run(progress, {
      playerA: 0,
      playerB: 0,
    });
    expect(progress.pokemonB.status.hp).toBe(0);
    expect(progress.pokemonA.status.hp).not.toBe(0);
    expect(progress.log.map(toString)).toStrictEqual([
      "リザードンの かえんしょうしゃ！",
      "カメックスは 31 ダメージ受けた！",
      "カメックスの なみのり！",
      "リザードンは 122 ダメージ受けた！",
      "リザードンの かえんしょうしゃ！",
      "カメックスは 31 ダメージ受けた！",
      "カメックスの なみのり！",
      "リザードンは 122 ダメージ受けた！",
      "リザードンは たおれた！",
    ]);
  });

  test("天候ログでも瀕死になることがある", () => {
    let progress: Progress = {
      pokemonA: {
        ...kamex,
        status: {
          ...kamex.status,
          hp: 32,
        },
      },
      pokemonB: {
        ...rizadon,
        status: {
          ...rizadon.status,
          hp: 100,
        },
      },
      environment: hail,
      log: [],
    };
    progress = run(progress, {
      playerA: 0,
      playerB: 0,
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "リザードンの かえんしょうしゃ！",
      "カメックスは 31 ダメージ受けた！",
      "カメックスの なみのり！",
      "リザードンは 122 ダメージ受けた！",
      "リザードンは たおれた！",
      "あられが 降りつづけている",
      "あられが カメックスを おそう！",
      "カメックスは たおれた！",
    ]);
  });
});
