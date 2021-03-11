export type Weather = "sunlight" | "rain" | "sandstorm" | "hail";

export type Terrain = "electric" | "grassy" | "misty" | "psychic";

export type Environment = {
  weather: { value: Weather; count: number } | "none";
  terrain: { value: Terrain; count: number } | "none";
};
