import {
  overrideWeather,
  overrideTerrain,
  nextEnv,
} from "@/domain/controller/environment";
import { damage } from "@/domain/controller/pokemon";
import {
  grassy,
  normalEnv,
  psychic,
  rainElectric,
  sandstormMisty,
  sunlight,
} from "__tests__/mock/environment";
import {
  pikachu,
  kamex,
  fushigibana,
  rizadon,
  solrock,
} from "__tests__/mock/pokemon";

describe("environment", () => {
  describe("環境の変化", () => {
    test("天気やフィールドは上書きできる", () => {
      expect(overrideWeather(normalEnv, "sunlight")).toStrictEqual(sunlight);
      expect(overrideTerrain(normalEnv, "grassy")).toStrictEqual(grassy);
      expect(
        overrideWeather(overrideTerrain(normalEnv, "electric"), "rain")
      ).toStrictEqual(rainElectric);
      expect(
        overrideWeather(overrideTerrain(rainElectric, "misty"), "sandstorm")
      ).toStrictEqual(sandstormMisty);
    });

    test("ターンが経過して環境が更新される", () => {
      expect(nextEnv(normalEnv)).toStrictEqual(normalEnv);
      expect(nextEnv(rainElectric)).toStrictEqual({
        weather: { value: "rain", count: 4 },
        terrain: { value: "electric", count: 4 },
      });
      expect(
        nextEnv({
          weather: { value: "rain", count: 1 },
          terrain: { value: "electric", count: 1 },
        })
      ).toStrictEqual(normalEnv);
      expect(
        nextEnv({
          weather: { value: "hail", count: 3 },
          terrain: { value: "psychic", count: 1 },
        })
      ).toStrictEqual({
        weather: { value: "hail", count: 2 },
        terrain: "none",
      });
    });
  });

  describe("ダメージの変化", () => {
    test("環境が通常の時は何にも影響されない", () => {
      const attacker = pikachu;
      const defencer = kamex;

      expect(damage(2, attacker, defencer, normalEnv)).toBe(17);
      expect(damage(0, attacker, defencer, normalEnv)).toBe(62);
    });

    test("エレキフィールド下ででんきタイプの技の威力が1.3倍", () => {
      const attacker = pikachu;
      const defencer = kamex;

      expect(damage(2, attacker, defencer, rainElectric)).toBe(17); // でんこうせっかはノーマル技なのでそのまま
      expect(damage(0, attacker, defencer, rainElectric)).toBe(80);
    });

    test("グラスフィールド下でくさタイプの技の威力が1.3倍", () => {
      const attacker = fushigibana;
      const defencer = rizadon;

      expect(damage(0, attacker, defencer, normalEnv)).toBe(25);
      expect(damage(0, attacker, defencer, grassy)).toBe(33);
    });

    test("サイコフィールド下でエスパータイプの技の威力が1.3倍", () => {
      const attacker = solrock;
      const defencer = rizadon;

      expect(damage(1, attacker, defencer, normalEnv)).toBe(24);
      expect(damage(1, attacker, defencer, psychic)).toBe(30);
    });

    test("ミストフィールド下でドラゴンタイプの技の威力が0.5倍", () => {
      const attacker = kamex;
      const defencer = rizadon;

      expect(damage(1, attacker, defencer, normalEnv)).toBe(39);
      expect(damage(1, attacker, defencer, sandstormMisty)).toBe(20);
    });

    test("あめ下でみず技のダメージが増えてほのお技のダメージが減る", () => {
      const p1 = kamex;
      const p2 = rizadon;

      expect(damage(0, p1, p2, normalEnv)).toBe(122);
      expect(damage(0, p2, p1, normalEnv)).toBe(31);

      expect(damage(0, p1, p2, rainElectric)).toBe(182);
      expect(damage(0, p2, p1, rainElectric)).toBe(15);
    });

    test("はれ下でほのお技のダメージが増えてみず技のダメージが減る", () => {
      const p1 = kamex;
      const p2 = rizadon;

      expect(damage(0, p1, p2, normalEnv)).toBe(122);
      expect(damage(0, p2, p1, normalEnv)).toBe(31);

      expect(damage(0, p1, p2, sunlight)).toBe(60);
      expect(damage(0, p2, p1, sunlight)).toBe(47);
    });

    test("すなあらし下でいわタイプの特防があがる", () => {
      const attacker = rizadon;
      const defencer = solrock;

      expect(damage(0, attacker, defencer, normalEnv)).toBe(46);
      expect(damage(0, attacker, defencer, sandstormMisty)).toBe(31);
    });
  });
});
