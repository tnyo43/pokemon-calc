import {
  overrideTerrain,
  updateEnvironment,
  isTerrainActive,
} from "@/domain/controller/environment";
import {
  grassy,
  normalEnv,
  psychic,
  rainElectric,
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
  test("上書きできる", () => {
    expect(overrideTerrain(normalEnv, "grassy")).toStrictEqual(grassy);
    expect(
      isTerrainActive(overrideTerrain(grassy, "electric"), "electric")
    ).toBe(true);
    expect(
      isTerrainActive(overrideTerrain(sandstormMisty, "psychic"), "psychic")
    ).toBe(true);
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
      expect(damage(0, pikachu, kamex, rainElectric)).toBe(80);
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
  });

  describe("ミストフィールド", () => {
    test("ドラゴンタイプの技の威力が0.5倍", () => {
      expect(damage(1, kamex, rizadon, normalEnv)).toBe(39);
      expect(damage(1, kamex, rizadon, sandstormMisty)).toBe(20);
    });
  });
});
