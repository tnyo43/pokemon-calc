import { runAction } from "@/domain/controller/battle/action";
import { passTurn } from "@/domain/controller/battle/turn";
import { apply } from "@/domain/controller/move";
import { currentPokemon } from "@/domain/controller/player";
import { speed } from "@/domain/controller/pokemon";
import { Progress } from "@/domain/model/battle";
import { toString } from "@/domain/model/log";
import { hail, normalEnv, psychic, sunlight } from "__tests__/mock/environment";
import { player, playerA, playerB } from "__tests__/mock/player";
import {
  kamex,
  pikachu,
  rizadon,
  weavile,
  fushigibana,
  solrock,
  damagedPokemon,
} from "__tests__/mock/pokemon";
import * as mockRandom from "@/utils/random";

describe("battle/action", () => {
  let probabilitySpy: jest.SpyInstance<boolean, [p: number]>;

  beforeEach(() => {
    probabilitySpy = jest
      .spyOn(mockRandom, "probability")
      .mockImplementation((_) => true);
    apply({ battle: { hit: "probability", sideEffect: "none" } });
  });

  afterEach(() => {
    probabilitySpy.mockClear();
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
      playerA: player([pikachu]),
      playerB: player([weavile]),
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
      playerB: player([damagedPokemon(kamex, 10), pikachu]),
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
      playerA: player([weavile]),
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
      playerA: player([damagedPokemon(pikachu, 1)]),
      playerB: player([damagedPokemon(weavile, 1)], "shigeru"),
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
      playerA: player([kamex, pikachu], "satoshi"),
      playerB: player([weavile, rizadon], "shigeru"),
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
      playerA: player([fushigibana]),
      playerB: player([weavile]),
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
      playerA: player([solrock]),
      playerB: player([fushigibana]),
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

  describe("失敗する技がある", () => {
    let progress: Progress = {
      playerA: player([pikachu]),
      playerB,
      environment: psychic,
      log: [],
    };
    progress = runAction(progress, {
      playerA: { type: "fight", index: 2 },
      playerB: { type: "fight", index: 0 },
    });
    expect(progress.log.map(toString)).toStrictEqual([
      "ピカチュウの でんこうせっか！",
      "しかし うまくきまらなかった",
      "カメックスの なみのり！",
      "ピカチュウは 91 ダメージ受けた！",
    ]);
  });
});
