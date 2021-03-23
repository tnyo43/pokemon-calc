import {
  overrideTerrain,
  updateEnvironment,
  isTerrainActive,
  affectedEnvironment,
  terrainRecover,
} from "@/domain/controller/environment";
import { Environment } from "@/domain/model/environment";
import {
  grassy,
  normalEnv,
  psychic,
  sandstormMisty,
} from "__tests__/mock/environment";
import {
  pikachu,
  kamex,
  rizadon,
  solrock,
  damage,
} from "__tests__/mock/pokemon";

describe("environment/terrain", () => {
  const electric: Environment = {
    weather: "none",
    terrain: { value: "electric", count: 5 },
  };

  test("上書きできる", () => {
    expect(overrideTerrain(normalEnv, "grassy")).toStrictEqual(grassy);
    expect(overrideTerrain(grassy, "electric")).toStrictEqual(electric);
    expect(
      isTerrainActive(overrideTerrain(sandstormMisty, "psychic"), "psychic")
    ).toBe(true);
  });

  test("浮いているとフィールドの影響を受けない", () => {
    expect(affectedEnvironment(sandstormMisty, rizadon)).toStrictEqual({
      weather: { value: "sandstorm", count: 5 },
      terrain: "none",
    });
    expect(affectedEnvironment(sandstormMisty, pikachu)).toStrictEqual(
      sandstormMisty
    );
  });

  test("5ターン続く", () => {
    let environment = overrideTerrain(normalEnv, "grassy");
    expect(isTerrainActive(environment, "grassy")).toBe(true);
    for (let i = 0; i < 4; i += 1) environment = updateEnvironment(environment);
    expect(isTerrainActive(environment, "grassy")).toBe(true);
    environment = updateEnvironment(environment);
    expect(environment).toStrictEqual(normalEnv);
  });

  describe("エレキフィールド", () => {
    test("でんきタイプの技の威力が1.3倍", () => {
      expect(damage(0, pikachu, kamex, normalEnv)).toBe(62);
      expect(damage(0, pikachu, kamex, electric)).toBe(80);
    });
  });

  describe("サイコフィールド", () => {
    test("エスパータイプの技の威力が1.3倍", () => {
      expect(damage(1, solrock, rizadon, normalEnv)).toBe(24);
      expect(damage(1, solrock, rizadon, psychic)).toBe(30);
    });
  });

  describe("グラスフィールド", () => {
    test("草タイプの技の威力が1.3倍", () => {
      expect(damage(1, solrock, rizadon, normalEnv)).toBe(24);
      expect(damage(1, solrock, rizadon, psychic)).toBe(30);
    });

    test("ダメージを回復する", () => {
      expect(terrainRecover(grassy, pikachu)).not.toBe(0);
      expect(terrainRecover(grassy, rizadon)).toBe(0);
      expect(terrainRecover(electric, pikachu)).toBe(0);
    });
  });

  describe("ミストフィールド", () => {
    test("ドラゴンタイプの技の威力が0.5倍", () => {
      expect(damage(1, kamex, rizadon, normalEnv)).toBe(39);
      expect(damage(1, kamex, rizadon, sandstormMisty)).toBe(20);
    });
  });
});
