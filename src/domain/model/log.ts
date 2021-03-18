import { Pokemon } from "@/domain/model/pokemon";
import { Weather } from "@/domain/model/environment";

export type Log =
  | { label: "attack"; name: string; move: string }
  | { label: "damage"; name: string; damage: number }
  | { label: "weather"; weather: Weather; isEnd: boolean }
  | { label: "weather damage"; weather: Weather; name: string }
  | { label: "ko"; name: string };

export const attackLog = (pokemon: Pokemon, moveIndex: number): Log => ({
  label: "attack",
  name: pokemon.name,
  move: pokemon.moves[moveIndex].name,
});

export const damageLog = (pokemon: Pokemon, damage: number): Log => ({
  label: "damage",
  name: pokemon.name,
  damage,
});

export const weatherLog = (weather: Weather, isEnd: boolean): Log => ({
  label: "weather",
  weather,
  isEnd,
});

export const weatherDamageLog = (weather: Weather, pokemon: Pokemon): Log => ({
  label: "weather damage",
  weather,
  name: pokemon.name,
});

export const koLog = (pokemon: Pokemon): Log => ({
  label: "ko",
  name: pokemon.name,
});

export const add = (logs: Log[], log: Log) => logs.concat(log);

const toStringAttack = ({ name, move }: { name: string; move: string }) =>
  `${name}の ${move}！`;

const toStringDamage = ({ name, damage }: { name: string; damage: number }) =>
  `${name}は ${damage} ダメージ受けた！`;

const toStringWeather = ({
  weather,
  isEnd,
}: {
  weather: Weather;
  isEnd: boolean;
}) => {
  switch (weather) {
    case "sunlight":
      return isEnd ? "日差しが 元に戻った！" : "日差しが 強い";
    case "rain":
      return isEnd ? "雨が 上がった！" : "雨が 降りつづいている";
    case "sandstorm":
      return isEnd ? "砂あらしが おさまった！" : "砂あらしが ふきあれる";
    case "hail":
      return isEnd ? "あられが 止んだ！" : "あられが 降りつづけている";
  }
};

const toStringWeatherDamage = ({
  weather,
  name,
}: {
  weather: Weather;
  name: string;
}) => {
  if (weather === "sandstorm") return `砂あらしが ${name}を おそう！`;
  else if (weather === "hail") return `あられが ${name}を おそう！`;
  return "";
};

const toStringKO = ({ name }: { name: string }) => `${name}は たおれた！`;

export const toString = (log: Log): string => {
  switch (log.label) {
    case "attack":
      return toStringAttack(log);
    case "damage":
      return toStringDamage(log);
    case "weather":
      return toStringWeather(log);
    case "weather damage":
      return toStringWeatherDamage(log);
    case "ko":
      return toStringKO(log);
  }
};
