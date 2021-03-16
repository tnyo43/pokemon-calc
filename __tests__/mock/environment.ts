import { Environment } from "@/domain/model/environment";

export const normalEnv: Environment = {
  weather: "none",
  terrain: "none",
};

export const sunlight: Environment = {
  weather: { value: "sunlight", count: 5 },
  terrain: "none",
};

export const grassy: Environment = {
  weather: "none",
  terrain: { value: "grassy", count: 5 },
};

export const rainElectric: Environment = {
  weather: { value: "rain", count: 5 },
  terrain: { value: "electric", count: 5 },
};

export const sandstormMisty: Environment = {
  weather: { value: "sandstorm", count: 5 },
  terrain: { value: "misty", count: 5 },
};

export const psychic: Environment = {
  weather: "none",
  terrain: { value: "psychic", count: 5 },
};

export const hail: Environment = {
  weather: { value: "hail", count: 5 },
  terrain: "none",
};
