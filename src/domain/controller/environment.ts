import { Weather, Terrain, Environment } from "@/domain/model/environment";

export const overrideWeather = (
  env: Environment,
  weather: Weather
): Environment => ({
  ...env,
  weather: { value: weather, count: 5 },
});

export const overrideTerrain = (
  env: Environment,
  terrain: Terrain
): Environment => ({
  ...env,
  terrain: { value: terrain, count: 5 },
});

export const nextEnv = (env: Environment): Environment => {
  const { weather, terrain } = env;
  return {
    ...env,
    weather:
      weather === "none" || weather.count === 1
        ? "none"
        : {
            value: weather.value,
            count: weather.count - 1,
          },
    terrain:
      terrain === "none" || terrain.count === 1
        ? "none"
        : {
            value: terrain.value,
            count: terrain.count - 1,
          },
  };
};
