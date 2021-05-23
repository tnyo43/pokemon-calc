import { runAction } from "@/domain/controller/progress/action";
import { applySub } from "@/domain/controller/move";
import { currentPokemon } from "@/domain/controller/player";
import { Progress } from "@/domain/model/progress";
import { toString } from "@/domain/model/log";
import { normalEnv } from "__tests__/mock/environment";
import { player, playerA, playerB } from "__tests__/mock/player";
import {
  pikachu,
  weavile,
  fushigibana,
  solrock,
  magikarp,
  breloom,
} from "__tests__/mock/pokemon";
import * as mockRandom from "@/utils/random";
import { addAilment } from "@/domain/controller/ailment";

describe("battle/ailment", () => {
  let probabilitySpy: jest.SpyInstance<boolean, [p: number]>;
  let rangeSpy: jest.SpyInstance<number, [p: number, q: number, r: number]>;

  beforeEach(() => {
    probabilitySpy = jest
      .spyOn(mockRandom, "probability")
      .mockImplementation((_) => true);
    rangeSpy = jest.spyOn(mockRandom, "range").mockImplementation(() => 3);
    applySub({ battle: { hit: "probability", sideEffect: "none" } });
  });

  afterEach(() => {
    probabilitySpy.mockClear();
    rangeSpy.mockClear();
  });

  test("状態異常になる", () => {
    probabilitySpy = jest
      .spyOn(mockRandom, "probability")
      .mockReturnValue(true);
    let progress: Progress = {
      playerA: player([breloom]),
      playerB: player([magikarp]),
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
      playerA: player([solrock]),
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
      playerA: player([addAilment(weavile, "paralysis")]),
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
      playerA: player([addAilment(fushigibana, "freeze")]),
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
    let progress: Progress = {
      playerA: player([solrock, pikachu]),
      playerB: player([magikarp]),
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
    applySub({ battle: { sideEffect: "always", hit: "always" } });
    probabilitySpy = jest
      .spyOn(mockRandom, "probability")
      .mockReturnValue(false);
    let progress: Progress = {
      playerA: player([weavile]),
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
    applySub({ battle: { sideEffect: "always" } });
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
    applySub({ battle: { sideEffect: "always" } });
    let progress: Progress = {
      playerA: player([pikachu]),
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
      playerA: player([breloom]),
      playerB: player([fushigibana]),
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
      playerA: player([breloom]),
      playerB: player([addAilment(magikarp, "burn")]),
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
