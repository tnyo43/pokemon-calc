import { run } from "@/domain/controller/battle";
import { currentPokemon } from "@/domain/controller/player";
import { Commands, Progress } from "@/domain/model/battle";
import { toString } from "@/domain/model/log";
import {
  hail,
  normalEnv,
  sandstormMisty,
  sunlight,
} from "__tests__/mock/environment";
import { playerA, playerB } from "__tests__/mock/player";
import { kamex, pikachu, rizadon, weavile } from "__tests__/mock/pokemon";

describe("battle", () => {
  test("天候なし、通常の攻撃のやりとり", () => {
    const progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [rizadon],
      },
      playerB: {
        ...playerB,
        pokemons: [kamex],
      },
      environment: normalEnv,
      log: [],
    };
    const command: Commands = {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 0 },
    };

    const result = run(progress, command);
    expect(currentPokemon(result.playerA).status.hp).toBe(31);
    expect(currentPokemon(result.playerB).status.hp).toBe(123);
    expect(result.environment).toStrictEqual(normalEnv);
    expect(result.log.map(toString)).toStrictEqual([
      "リザードンの かえんしょうしゃ！",
      "カメックスは 31 ダメージ受けた！",
      "カメックスの なみのり！",
      "リザードンは 122 ダメージ受けた！",
      "",
    ]);
  });

  test("はれ", () => {
    const progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [rizadon],
      },
      playerB: {
        ...playerB,
        pokemons: [kamex],
      },
      environment: sunlight,
      log: [],
    };
    const command: Commands = {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 0 },
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
      "",
    ]);
  });

  test("すなあらしのダメージとターン経過", () => {
    const progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [rizadon],
      },
      playerB: {
        ...playerB,
        pokemons: [kamex],
      },
      environment: sandstormMisty,
      log: [],
    };
    const command: Commands = {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 0 },
    };

    const result = run(progress, command);
    expect(currentPokemon(result.playerA).status.hp).toBe(22);
    expect(currentPokemon(result.playerB).status.hp).toBe(114);
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
      "",
    ]);
  });

  test("優先度+1のわざが先に出る", () => {
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [pikachu, rizadon],
      },
      playerB: {
        ...playerB,
        pokemons: [weavile],
      },
      environment: normalEnv,
      log: [],
    };
    progress = run(progress, {
      playerA: { type: "fight", index: 2 },
      playerB: { type: "fight", index: 0 },
    });
    progress = run(progress, {
      playerA: { type: "fight", index: 2 },
      playerB: { type: "fight", index: 1 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "ピカチュウの でんこうせっか！",
      "マニューラは 24 ダメージ受けた！",
      "マニューラの あくのはどう！",
      "ピカチュウは 46 ダメージ受けた！",
      "",
      "マニューラの こおりのつぶて！",
      "ピカチュウは 78 ダメージ受けた！",
      "ピカチュウは たおれた！",
      "",
    ]);
  });

  test("残りHPが0になると戦闘不能になる", () => {
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [kamex],
      },
      playerB: {
        ...playerB,
        pokemons: [rizadon, pikachu],
      },
      environment: normalEnv,
      log: [],
    };
    progress = run(progress, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 0 },
    });
    progress = run(progress, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 0 },
    });
    expect(currentPokemon(progress.playerB).status.hp).toBe(0);
    expect(currentPokemon(progress.playerA).status.hp).not.toBe(0);
    expect(progress.log.map(toString)).toStrictEqual([
      "リザードンの かえんしょうしゃ！",
      "カメックスは 31 ダメージ受けた！",
      "カメックスの なみのり！",
      "リザードンは 122 ダメージ受けた！",
      "",
      "リザードンの かえんしょうしゃ！",
      "カメックスは 31 ダメージ受けた！",
      "カメックスの なみのり！",
      "リザードンは 122 ダメージ受けた！",
      "リザードンは たおれた！",
      "",
    ]);
  });

  test("天候ログでも瀕死になることがある", () => {
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
          pikachu,
        ],
      },
      playerB: {
        ...playerB,
        pokemons: [
          {
            ...rizadon,
            status: {
              ...rizadon.status,
              hp: 100,
            },
          },
          weavile,
        ],
      },
      environment: hail,
      log: [],
    };
    progress = run(progress, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 0 },
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
      "",
    ]);
  });

  test("試合結果のログが追加される", () => {
    const beginning: Progress = {
      playerA: {
        ...playerA,
        pokemons: [
          {
            ...pikachu,
            status: {
              ...pikachu.status,
              hp: 1,
            },
          },
        ],
      },
      playerB: {
        ...playerB,
        pokemons: [
          {
            ...weavile,
            status: {
              ...weavile.status,
              hp: 1,
            },
          },
        ],
      },
      environment: hail,
      log: [],
    };
    let progress = run(beginning, {
      playerA: { type: "fight", index: 2 },
      playerB: { type: "fight", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "ピカチュウの でんこうせっか！",
      "マニューラは 24 ダメージ受けた！",
      "マニューラは たおれた！",
      "shigeruとの 勝負に 勝った！",
      "",
    ]);
    progress = run(beginning, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 1 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "マニューラの こおりのつぶて！",
      "ピカチュウは 78 ダメージ受けた！",
      "ピカチュウは たおれた！",
      "shigeruとの 勝負に 敗れた！",
      "",
    ]);
  });

  test("ポケモンを交換できる", () => {
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [kamex, pikachu],
      },
      playerB: {
        ...playerB,
        pokemons: [weavile, rizadon],
      },
      environment: normalEnv,
      log: [],
    };
    progress = run(progress, {
      playerA: { type: "change", index: 1 },
      playerB: { type: "fight", index: 0 },
    });
    progress = run(progress, {
      playerA: { type: "change", index: 0 },
      playerB: { type: "change", index: 1 },
    });
    progress = run(progress, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "change", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "satoshiは カメックスを引っ込めて ピカチュウを繰り出した！",
      "マニューラの あくのはどう！",
      "ピカチュウは 46 ダメージ受けた！",
      "",
      "shigeruは マニューラを引っ込めて リザードンを繰り出した！",
      "satoshiは ピカチュウを引っ込めて カメックスを繰り出した！",
      "",
      "shigeruは リザードンを引っ込めて マニューラを繰り出した！",
      "カメックスの なみのり！",
      "マニューラは 61 ダメージ受けた！",
      "",
    ]);
  });
});
