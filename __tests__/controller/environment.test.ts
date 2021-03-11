import {
  overrideWeather,
  overrideTerrain,
  nextEnv,
} from "@/domain/controller/environment";
import {
  grassy,
  normalEnv,
  rainElectric,
  sandstormMisty,
  sunlight,
} from "__tests__/mock/environment";

describe("environment", () => {
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
