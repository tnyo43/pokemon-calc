import { MoveIndex } from "@/domain/model/move";
import { Pokemon } from "@/domain/model/pokemon";
import { Weather } from "@/domain/model/environment";

export type Log =
  | { label: "attack"; name: string; move: string }
  | { label: "damage"; name: string; damage: number }
  | { label: "weather"; weather: Weather; isEnd: boolean }
  | { label: "weather damage"; weather: Weather; name: string };

export const attackLog = (pokemon: Pokemon, moveIndex: MoveIndex): Log => ({
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

export const toString = (log: Log): string => {
  if (log.label === "attack") return `${log.name} の ${log.move}！`;
  else if (log.label == "damage")
    return `${log.name} は ${log.damage} ダメージ受けた！`;
  else if (log.label === "weather") {
    const { weather, isEnd } = log;
    if (weather === "sunlight") {
      if (isEnd) return "日差しが 元に戻った！";
      else return "日差しが 強い";
    } else if (weather === "rain") {
      if (isEnd) return "雨が 上がった！";
      else return "雨が 降りつづいている";
    } else if (weather === "hail") {
      if (isEnd) return "あられが 止んだ！";
      else return "あられが 降りつづけている";
    } else {
      if (isEnd) return "砂あらしが おさまった！";
      else return "砂あらしが ふきあれる";
    }
  } else if (log.label === "weather damage") {
    const { weather, name } = log;
    if (weather === "sandstorm") return `砂あらしが ${name}を おそう！`;
    else if (weather === "hail") return `あられが ${name}を おそう！`;
    return "";
  }
  return "";
};
