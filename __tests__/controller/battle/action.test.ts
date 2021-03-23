import { runAction } from "@/domain/controller/battle/action";
import { passTurn } from "@/domain/controller/battle/turn";
import { apply } from "@/domain/controller/move";
import { currentPokemon } from "@/domain/controller/player";
import { speed } from "@/domain/controller/pokemon";
import { Progress } from "@/domain/model/battle";
import { toString } from "@/domain/model/log";
import { hail, normalEnv, sunlight } from "__tests__/mock/environment";
import { playerA, playerB } from "__tests__/mock/player";
import {
  kamex,
  pikachu,
  rizadon,
  weavile,
  fushigibana,
  solrock,
  damagedPokemon,
  magikarp,
  breloom,
} from "__tests__/mock/pokemon";
import * as mockRandom from "@/utils/random";
import { Ailment } from "@/domain/model/ailment";
import { addAilment } from "@/domain/controller/ailment";
import { Pokemon } from "@/domain/model/pokemon";

describe("battle/action", () => {
  let probabilitySpy: jest.SpyInstance<boolean, [p: number]>;
  let rangeSpy: jest.SpyInstance<number, [p: number, q: number, r: number]>;
  let ailmentSpy: jest.SpyInstance<boolean, [p: Ailment["label"], q: Pokemon]>;

  beforeAll(() => {
    apply({ battle: { hit: "probability", sideEffect: "none" } });
  });

  beforeEach(() => {
    probabilitySpy = jest
      .spyOn(mockRandom, "probability")
      .mockImplementation((_) => true);
    rangeSpy = jest.spyOn(mockRandom, "range").mockImplementation(() => 3);
  });

  afterEach(() => {
    probabilitySpy.mockClear();
    rangeSpy.mockClear();
    if (ailmentSpy) ailmentSpy.mockClear();
    apply({ battle: { hit: "probability", sideEffect: "none" } });
  });

  test("通常の攻撃のやりとり", () => {
    let progress: Progress = {
      playerA,
      playerB,
      environment: normalEnv,
      log: [],
    };
    progress = runAction(progress, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 0 },
    });
    expect(currentPokemon(progress.playerA).status.hp).toBe(31);
    expect(currentPokemon(progress.playerB).status.hp).toBe(123);
    expect(progress.environment).toStrictEqual(normalEnv);
    expect(progress.log.map(toString)).toStrictEqual([
      "リザードンの かえんしょうしゃ！",
      "カメックスは 31 ダメージ受けた！",
      "カメックスの なみのり！",
      "リザードンは 122 ダメージ受けた！",
    ]);
  });

  test("はれ天候で炎と水の威力が変化する", () => {
    let progress: Progress = {
      playerA,
      playerB,
      environment: sunlight,
      log: [],
    };
    progress = runAction(progress, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "リザードンの かえんしょうしゃ！",
      "カメックスは 47 ダメージ受けた！",
      "カメックスの なみのり！",
      "リザードンは 60 ダメージ受けた！",
    ]);
  });

  test("優先度+1のわざが先に出る", () => {
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [pikachu],
      },
      playerB: {
        ...playerB,
        pokemons: [weavile],
      },
      environment: normalEnv,
      log: [],
    };
    progress = runAction(progress, {
      playerA: { type: "fight", index: 2 },
      playerB: { type: "fight", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "ピカチュウの でんこうせっか！",
      "マニューラは 24 ダメージ受けた！",
      "マニューラの あくのはどう！",
      "ピカチュウは 46 ダメージ受けた！",
    ]);
    expect(
      speed(currentPokemon(progress.playerA)) <
        speed(currentPokemon(progress.playerB))
    ).toBe(true);
  });

  test("残りHPが0になると戦闘不能になる", () => {
    let progress: Progress = {
      playerA,
      playerB: {
        ...playerB,
        pokemons: [damagedPokemon(kamex, 10), pikachu],
      },
      environment: normalEnv,
      log: [],
    };
    progress = runAction(progress, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 0 },
    });
    expect(currentPokemon(progress.playerA).status.hp).not.toBe(0);
    expect(currentPokemon(progress.playerB).status.hp).toBe(0);
    expect(progress.log.map(toString)).toStrictEqual([
      "リザードンの かえんしょうしゃ！",
      "カメックスは 31 ダメージ受けた！",
      "カメックスは たおれた！",
    ]);
  });

  test("命中不安の技は外れる可能性がある", () => {
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [weavile],
      },
      playerB,
      environment: normalEnv,
      log: [],
    };
    probabilitySpy = jest
      .spyOn(mockRandom, "probability")
      .mockReturnValue(false);
    progress = runAction(progress, {
      playerA: { type: "fight", index: 2 },
      playerB: { type: "fight", index: 0 },
    });
    probabilitySpy = jest
      .spyOn(mockRandom, "probability")
      .mockReturnValue(true);
    progress = runAction(progress, {
      playerA: { type: "fight", index: 2 },
      playerB: { type: "fight", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "マニューラの ふぶき！",
      "カメックスには 当たらなかった！",
      "カメックスの なみのり！",
      "マニューラは 61 ダメージ受けた！",
      "マニューラの ふぶき！",
      "カメックスは 2 ダメージ受けた！",
      "カメックスの なみのり！",
      "マニューラは 61 ダメージ受けた！",
    ]);
  });

  test("試合結果のログが追加される", () => {
    const beginning: Progress = {
      playerA: {
        ...playerA,
        pokemons: [damagedPokemon(pikachu, 1)],
      },
      playerB: {
        ...playerB,
        pokemons: [damagedPokemon(weavile, 1)],
      },
      environment: hail,
      log: [],
    };
    let progress = runAction(beginning, {
      playerA: { type: "fight", index: 2 },
      playerB: { type: "fight", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "ピカチュウの でんこうせっか！",
      "マニューラは 24 ダメージ受けた！",
      "マニューラは たおれた！",
      "shigeruとの 勝負に 勝った！",
    ]);
    progress = runAction(beginning, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 1 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "マニューラの こおりのつぶて！",
      "ピカチュウは 78 ダメージ受けた！",
      "ピカチュウは たおれた！",
      "shigeruとの 勝負に 敗れた！",
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
    progress = runAction(progress, {
      playerA: { type: "change", index: 1 },
      playerB: { type: "fight", index: 0 },
    });
    progress = runAction(progress, {
      playerA: { type: "change", index: 0 },
      playerB: { type: "change", index: 1 },
    });
    progress = runAction(progress, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "change", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "satoshiは カメックスを引っ込めて ピカチュウを繰り出した！",
      "マニューラの あくのはどう！",
      "ピカチュウは 46 ダメージ受けた！",
      "shigeruは マニューラを引っ込めて リザードンを繰り出した！",
      "satoshiは ピカチュウを引っ込めて カメックスを繰り出した！",
      "shigeruは リザードンを引っ込めて マニューラを繰り出した！",
      "カメックスの なみのり！",
      "マニューラは 61 ダメージ受けた！",
    ]);
  });

  test("バフ技でステータスが変化する", () => {
    let progress: Progress = {
      playerA,
      playerB,
      environment: normalEnv,
      log: [],
    };
    progress = runAction(progress, {
      playerA: { type: "fight", index: 3 },
      playerB: { type: "fight", index: 2 },
    });
    progress = runAction(progress, {
      playerA: { type: "fight", index: 2 },
      playerB: { type: "fight", index: 2 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "リザードンの はらだいこ！",
      "リザードンの 攻撃が 最大まで上がった",
      "リザードンの 体力が がくーんと下がった",
      "カメックスの てっぺき！",
      "カメックスの 防御が ぐーんと上がった",
      "リザードンの なきごえ！",
      "カメックスの 攻撃が 下がった",
      "カメックスの てっぺき！",
      "カメックスの 防御が ぐーんと上がった",
    ]);
    expect(currentPokemon(progress.playerB).status.defence).toBe(4);
    expect(currentPokemon(progress.playerB).status.attack).toBe(-1);
    expect(currentPokemon(progress.playerA).status.attack).toBe(6);
    expect(currentPokemon(progress.playerA).status.hp).toBe(76);
  });

  test("まもるを発動する", () => {
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [fushigibana],
      },
      playerB: {
        ...playerB,
        pokemons: [weavile],
      },
      environment: normalEnv,
      log: [],
    };
    expect(currentPokemon(progress.playerA).status.hp).toBe(156);
    progress = runAction(progress, {
      playerA: { type: "fight", index: 1 },
      playerB: { type: "fight", index: 1 },
    });
    progress = passTurn(progress);
    expect(currentPokemon(progress.playerA).status.hp).toBe(156);
    progress = runAction(progress, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 1 },
    });
    progress = passTurn(progress);
    expect(currentPokemon(progress.playerA).status.hp).toBe(64);
    expect(progress.log.map(toString)).toStrictEqual([
      "フシギバナの まもる！",
      "フシギバナは 守りの 体勢に 入った！",
      "マニューラの こおりのつぶて！",
      "フシギバナは 攻撃から 身を守った！",
      "",
      "マニューラの こおりのつぶて！",
      "フシギバナは 92 ダメージ受けた！",
      "フシギバナの タネばくだん！",
      "マニューラは 58 ダメージ受けた！",
      "",
    ]);
  });

  test("さいみんじゅつで眠る", () => {
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [solrock],
      },
      playerB: {
        ...playerB,
        pokemons: [fushigibana],
      },
      environment: normalEnv,
      log: [],
    };
    progress = runAction(progress, {
      playerA: { type: "fight", index: 2 },
      playerB: { type: "fight", index: 1 },
    });
    progress = passTurn(progress);
    progress = runAction(progress, {
      playerA: { type: "fight", index: 2 },
      playerB: { type: "fight", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "フシギバナの まもる！",
      "フシギバナは 守りの 体勢に 入った！",
      "ソルロックの さいみんじゅつ！",
      "フシギバナは 攻撃から 身を守った！",
      "",
      "フシギバナの タネばくだん！",
      "ソルロックは 92 ダメージ受けた！",
      "ソルロックの さいみんじゅつ！",
      "フシギバナは 眠ってしまった！",
    ]);
    expect(currentPokemon(progress.playerB).condition.ailment?.label).toBe(
      "sleep"
    );
  });

  test("状態異常になる", () => {
    probabilitySpy = jest
      .spyOn(mockRandom, "probability")
      .mockReturnValue(true);
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [breloom],
      },
      playerB: {
        ...playerB,
        pokemons: [magikarp],
      },
      environment: normalEnv,
      log: [],
    };

    expect(
      runAction(progress, {
        playerA: { type: "fight", index: 0 }, // しびれごな
        playerB: { type: "fight", index: 0 },
      }).log.map(toString)
    ).toStrictEqual([
      "キノガッサの しびれごな！",
      "コイキングは まひして 技が でにくくなった！",
      "コイキングは 体がしびれて 動けない！",
    ]);

    expect(
      runAction(progress, {
        playerA: { type: "fight", index: 1 }, // どくのこな
        playerB: { type: "fight", index: 0 },
      }).log.map(toString)
    ).toStrictEqual([
      "キノガッサの どくのこな！",
      "コイキングは 毒を あびた！",
      "コイキングの はねる！",
    ]);

    expect(
      runAction(progress, {
        playerA: { type: "fight", index: 2 }, // どくどく
        playerB: { type: "fight", index: 0 },
      }).log.map(toString)
    ).toStrictEqual([
      "キノガッサの どくどく！",
      "コイキングは 猛毒を あびた！",
      "コイキングの はねる！",
    ]);

    progress = {
      ...progress,
      playerA: {
        ...playerA,
        pokemons: [solrock],
      },
    };

    progress = runAction(progress, {
      playerA: { type: "fight", index: 2 }, // さいみんじゅつ
      playerB: { type: "fight", index: 0 },
    });
    expect(currentPokemon(progress.playerB).condition.ailment).toStrictEqual({
      label: "sleep",
      remaining: 2,
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "ソルロックの さいみんじゅつ！",
      "コイキングは 眠ってしまった！",
      "コイキングは ぐうぐうねむっている",
    ]);
  });

  test("まひすると技が失敗することがある", () => {
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [addAilment(weavile, "paralysis")],
      },
      playerB,
      environment: normalEnv,
      log: [],
    };
    probabilitySpy = jest
      .spyOn(mockRandom, "probability")
      .mockReturnValue(false);
    progress = runAction(progress, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 0 },
    });
    probabilitySpy = jest
      .spyOn(mockRandom, "probability")
      .mockReturnValue(true);
    progress = runAction(progress, {
      playerA: { type: "fight", index: 2 },
      playerB: { type: "fight", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "カメックスの なみのり！",
      "マニューラは 61 ダメージ受けた！",
      "マニューラの あくのはどう！",
      "カメックスは 27 ダメージ受けた！",
      "カメックスの なみのり！",
      "マニューラは 61 ダメージ受けた！",
      "マニューラは 体がしびれて 動けない！",
    ]);
  });

  test("凍ると確率で溶けるまで動けない", () => {
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [addAilment(fushigibana, "freeze")],
      },
      playerB,
      environment: normalEnv,
      log: [],
    };
    probabilitySpy = jest
      .spyOn(mockRandom, "probability")
      .mockReturnValue(true);
    progress = runAction(progress, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 0 },
    });
    probabilitySpy = jest
      .spyOn(mockRandom, "probability")
      .mockReturnValue(false);
    progress = runAction(progress, {
      playerA: { type: "fight", index: 0 },
      playerB: { type: "fight", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "フシギバナは 凍ってしまって 動けない！",
      "カメックスの なみのり！",
      "フシギバナは 27 ダメージ受けた！",
      "フシギバナの こおりが とけた！",
      "フシギバナの タネばくだん！",
      "カメックスは 84 ダメージ受けた！",
      "カメックスの なみのり！",
      "フシギバナは 27 ダメージ受けた！",
    ]);
  });

  test("眠ると数ターン起きない", () => {
    rangeSpy = jest.spyOn(mockRandom, "range").mockReturnValue(3);
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [solrock, pikachu],
      },
      playerB: {
        ...playerB,
        pokemons: [magikarp],
      },
      environment: normalEnv,
      log: [],
    };
    progress = runAction(progress, {
      playerA: { type: "fight", index: 2 }, // さいみんじゅつ
      playerB: { type: "fight", index: 0 },
    });
    progress = runAction(progress, {
      playerA: { type: "change", index: 1 },
      playerB: { type: "fight", index: 0 },
    });
    progress = runAction(progress, {
      playerA: { type: "change", index: 0 },
      playerB: { type: "fight", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "ソルロックの さいみんじゅつ！",
      "コイキングは 眠ってしまった！",
      "コイキングは ぐうぐうねむっている",
      "satoshiは ソルロックを引っ込めて ピカチュウを繰り出した！",
      "コイキングは ぐうぐうねむっている",
      "satoshiは ピカチュウを引っ込めて ソルロックを繰り出した！",
      "コイキングは 目をさました！",
      "コイキングの はねる！",
    ]);
  });

  test("氷技で凍ることがある", () => {
    apply({ battle: { sideEffect: "always" } });
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [weavile],
      },
      playerB,
      environment: normalEnv,
      log: [],
    };
    progress = runAction(progress, {
      playerA: { type: "fight", index: 2 }, // ふぶき
      playerB: { type: "fight", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "マニューラの ふぶき！",
      "カメックスは 2 ダメージ受けた！",
      "カメックスは 凍りついた！",
      "カメックスは 凍ってしまって 動けない！",
    ]);
  });

  test("炎技でやけどになることがある", () => {
    apply({ battle: { sideEffect: "always" } });
    let progress: Progress = {
      playerA,
      playerB,
      environment: normalEnv,
      log: [],
    };
    progress = runAction(progress, {
      playerA: { type: "fight", index: 0 }, // ふぶき
      playerB: { type: "fight", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "リザードンの かえんしょうしゃ！",
      "カメックスは 31 ダメージ受けた！",
      "カメックスは やけどを 負った！",
      "カメックスの なみのり！",
      "リザードンは 122 ダメージ受けた！",
    ]);
  });

  test("電気技で麻痺になることがある", () => {
    apply({ battle: { sideEffect: "always" } });
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [pikachu],
      },
      playerB,
      environment: normalEnv,
      log: [],
    };
    progress = runAction(progress, {
      playerA: { type: "fight", index: 0 }, // 10まんボルト
      playerB: { type: "fight", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "ピカチュウの 10まんボルト！",
      "カメックスは 62 ダメージ受けた！",
      "カメックスは まひして 技が でにくくなった！",
      "カメックスは 体がしびれて 動けない！",
    ]);
  });

  test("どく、やけど、こおりはならないタイプがある", () => {
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [breloom],
      },
      playerB: {
        ...playerB,
        pokemons: [fushigibana],
      },
      environment: normalEnv,
      log: [],
    };
    progress = runAction(progress, {
      playerA: { type: "fight", index: 1 }, // 毒の粉
      playerB: { type: "fight", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "フシギバナの タネばくだん！",
      "キノガッサは 12 ダメージ受けた！",
      "キノガッサの どくのこな！",
      "しかし うまくきまらなかった",
    ]);
  });

  test("すでに状態異常になっていると、これ以上はならない", () => {
    let progress: Progress = {
      playerA: {
        ...playerA,
        pokemons: [breloom],
      },
      playerB: {
        ...playerB,
        pokemons: [addAilment(magikarp, "burn")],
      },
      environment: normalEnv,
      log: [],
    };
    progress = runAction(progress, {
      playerA: { type: "fight", index: 1 }, // 毒の粉
      playerB: { type: "fight", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "キノガッサの どくのこな！",
      "しかし うまくきまらなかった",
      "コイキングの はねる！",
    ]);
  });
});
