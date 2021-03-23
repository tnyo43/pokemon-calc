import {
  overrideWeather,
  updateEnvironment,
  damage as weatherDamage,
  isWeatherActive,
} from "@/domain/controller/environment";
import {
  hail,
  normalEnv,
  rainElectric,
  sandstormMisty,
  sunlight,
} from "__tests__/mock/environment";
import {
  pikachu,
  kamex,
  rizadon,
  solrock,
  weavile,
  damage,
} from "__tests__/mock/pokemon";

describe("environment/weather", () => {
  test("上書きできる", () => {
    expect(overrideWeather(normalEnv, "sunlight")).toStrictEqual(sunlight);
    expect(isWeatherActive(overrideWeather(sunlight, "rain"), "rain")).toBe(
      true
    );
    expect(
      isWeatherActive(overrideWeather(sandstormMisty, "hail"), "hail")
    ).toBe(true);
  });

  test("5ターン続く", () => {
    let environment = overrideWeather(normalEnv, "sunlight");
    expect(isWeatherActive(environment, "sunlight")).toBe(true);
    for (let i = 0; i < 4; i += 1) environment = updateEnvironment(environment);
    expect(isWeatherActive(environment, "sunlight")).toBe(true);
    environment = updateEnvironment(environment);
    expect(environment).toStrictEqual(normalEnv);
  });

  describe("にほんばれ", () => {
    test("ほのお技のダメージが増えてみず技のダメージが減る", () => {
      expect(damage(0, kamex, rizadon, normalEnv)).toBe(122);
      expect(damage(0, rizadon, kamex, normalEnv)).toBe(31);
      expect(damage(0, kamex, rizadon, sunlight)).toBe(60);
      expect(damage(0, rizadon, kamex, sunlight)).toBe(47);
    });
  });

  describe("あめ", () => {
    test("みず技のダメージが増えてほのお技のダメージが減る", () => {
      expect(damage(0, kamex, rizadon, normalEnv)).toBe(122);
      expect(damage(0, rizadon, kamex, normalEnv)).toBe(31);

      expect(damage(0, kamex, rizadon, rainElectric)).toBe(182);
      expect(damage(0, rizadon, kamex, rainElectric)).toBe(15);
    });
  });

  describe("すなあらし", () => {
    test("いわ、じめん、はがね以外ダメージ", () => {
      expect(weatherDamage(sandstormMisty, pikachu)).not.toBe(0);
      expect(weatherDamage(sandstormMisty, solrock)).toBe(0);
      expect(weatherDamage(sandstormMisty, weavile)).not.toBe(0);
    });

    test("いわタイプの特防があがる", () => {
      expect(damage(0, rizadon, solrock, normalEnv)).toBe(45);
      expect(damage(0, rizadon, solrock, sandstormMisty)).toBe(30);
    });
  });

  describe("あられ", () => {
    test("あられ下はこおり以外ダメージ", () => {
      expect(weatherDamage(hail, pikachu)).not.toBe(0);
      expect(weatherDamage(hail, solrock)).not.toBe(0);
      expect(weatherDamage(hail, weavile)).toBe(0);
    });
  });
});
