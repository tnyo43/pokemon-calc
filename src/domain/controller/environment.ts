import { Weather, Terrain, Environment } from "@/domain/model/environment";
import { hasType } from "@/domain/controller/type";
import { Pokemon } from "@/domain/model/pokemon";

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

export const updateEnvironment = (env: Environment): Environment => {
  const { weather, terrain } = env;
  return {
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

export const isTerrainActive = (environment: Environment, terrain: Terrain) =>
  environment.terrain !== "none" && environment.terrain.value === terrain;

export const isWeatherActive = (environment: Environment, weather: Weather) =>
  environment.weather !== "none" && environment.weather.value === weather;

export const affectedEnvironment = (
  environment: Environment,
  pokemon: Pokemon
): Environment =>
  hasType(pokemon, "flying")
    ? {
        ...environment,
        terrain: "none",
      }
    : environment;

export const weatherDamage = (environment: Environment, pokemon: Pokemon) =>
  (isWeatherActive(environment, "sandstorm") &&
    !(
      hasType(pokemon, "rock") ||
      hasType(pokemon, "ground") ||
      hasType(pokemon, "steel")
    )) ||
  (isWeatherActive(environment, "hail") && !hasType(pokemon, "ice"))
    ? Math.floor(pokemon.basicValue.hp / 16)
    : 0;

export const terrainRecover = (environment: Environment, pokemon: Pokemon) =>
  isTerrainActive(affectedEnvironment(environment, pokemon), "grassy")
    ? Math.floor(pokemon.basicValue.hp / 16)
    : 0;
