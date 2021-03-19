import { Weather } from "@/domain/model/environment";
import { Player } from "@/domain/model/player";

export type Log =
  | { label: "attack"; name: string; move: string }
  | { label: "damage"; name: string; damage: number }
  | { label: "change"; player: string; pokemonFrom: string; pokemonTo: string }
  | { label: "weather"; weather: Weather; isEnd: boolean }
  | { label: "weather damage"; weather: Weather; name: string }
  | { label: "ko"; name: string }
  | { label: "prepare"; name: string; pokemon: string }
  | { label: "result"; win: boolean; opponent: Player }
  | { label: "turnend" };

const toStringAttack = ({ name, move }: { name: string; move: string }) =>
  `${name}の ${move}！`;

const toStringDamage = ({ name, damage }: { name: string; damage: number }) =>
  `${name}は ${damage} ダメージ受けた！`;

const toStringChange = ({
  player,
  pokemonFrom,
  pokemonTo,
}: {
  player: string;
  pokemonFrom: string;
  pokemonTo: string;
}) => `${player}は ${pokemonFrom}を引っ込めて ${pokemonTo}を繰り出した！`;

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

const toStringPrepare = ({
  name,
  pokemon,
}: {
  name: string;
  pokemon: string;
}) => `${name}は ${pokemon}を繰り出した！`;

const toStringResult = ({
  win,
  opponent,
}: {
  win: boolean;
  opponent: Player;
}) => `${opponent.name}との 勝負に ${win ? "勝った" : "敗れた"}！`;

const toStringTurnEnd = (_: Log) => "";

export const toString = (log: Log): string => {
  switch (log.label) {
    case "attack":
      return toStringAttack(log);
    case "damage":
      return toStringDamage(log);
    case "change":
      return toStringChange(log);
    case "weather":
      return toStringWeather(log);
    case "weather damage":
      return toStringWeatherDamage(log);
    case "ko":
      return toStringKO(log);
    case "prepare":
      return toStringPrepare(log);
    case "result":
      return toStringResult(log);
    case "turnend":
      return toStringTurnEnd(log);
  }
};
