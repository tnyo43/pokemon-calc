import { Weather } from "@/domain/model/environment";
import { Player } from "@/domain/model/player";
import {
  StatusType,
  toString as toStringStatusParam,
} from "@/domain/model/stats";
import { Ailment } from "@/domain/model/ailment";

export type Log =
  | { label: "action"; name: string; move: string }
  | { label: "damage"; name: string; damage: number }
  | { label: "protect"; name: string }
  | { label: "protect succeed"; name: string }
  | { label: "ailment"; name: string; ailment: Ailment["label"] }
  | {
      label: "ailment damage";
      name: string;
      ailment: "poison" | "bad poison" | "burn";
    }
  | { label: "miss"; name: string }
  | {
      label: "cannotMove";
      name: string;
      cause: "paralysis" | "freeze" | "sleep";
    }
  | { label: "recover"; name: string; cause: "freeze" | "sleep" }
  | { label: "status"; name: string; param: StatusType; diff: number }
  | { label: "change"; player: string; pokemonFrom: string; pokemonTo: string }
  | { label: "weather"; weather: Weather; isEnd: boolean }
  | { label: "weather damage"; weather: Weather; name: string }
  | { label: "ko"; name: string }
  | { label: "prepare"; name: string; pokemon: string }
  | { label: "result"; win: boolean; opponent: Player }
  | { label: "turnend" };

const toStringAction = ({ name, move }: { name: string; move: string }) =>
  `${name}の ${move}！`;

const toStringDamage = ({ name, damage }: { name: string; damage: number }) =>
  `${name}は ${damage} ダメージ受けた！`;

const toStringProtect = ({ name }: { name: string }) =>
  `${name}は 守りの 体勢に 入った！`;

const toStringProtectSucceed = ({ name }: { name: string }) =>
  `${name}は 攻撃から 身を守った！`;

const toStringAilment = ({
  name,
  ailment,
}: {
  name: string;
  ailment: Ailment["label"];
}) =>
  `${name}は ${
    ailment === "burn"
      ? "やけどを 負った"
      : ailment === "freeze"
      ? "凍りついた"
      : ailment === "paralysis"
      ? "まひして 技が でにくくなった"
      : ailment === "poison"
      ? "毒を あびた"
      : ailment === "bad poison"
      ? "猛毒を あびた"
      : "眠ってしまった"
  }！`;

const toStringAilmentDamage = ({
  name,
  ailment,
}: {
  name: string;
  ailment: "poison" | "bad poison" | "burn";
}) => `${name}は ${ailment === "burn" ? "やけど" : "毒"}の ダメージを受けた！`;

const toStringMiss = ({ name }: { name: string }) =>
  `${name}には 当たらなかった！`;

const toStringCannotMove = ({
  name,
  cause,
}: {
  name: string;
  cause: "paralysis" | "freeze" | "sleep";
}) =>
  cause === "sleep"
    ? `${name}は ぐうぐうねむっている`
    : `${name}は ${
        cause === "paralysis" ? "体がしびれて" : "凍ってしまって"
      } 動けない！`;

const toStringRecover = ({
  name,
  cause,
}: {
  name: string;
  cause: "freeze" | "sleep";
}) =>
  cause === "sleep"
    ? `${name}は 目をさました！`
    : `${name}の こおりが とけた！`;

const toStringStatus = ({
  name,
  param,
  diff,
}: {
  name: string;
  param: StatusType;
  diff: number;
}) =>
  `${name}の ${toStringStatusParam(param)}が ${
    diff === 12
      ? "最大まで上がった"
      : diff === 1
      ? "上がった"
      : diff === 2
      ? "ぐーんと上がった"
      : diff > 2
      ? "ぐぐーんと上がった"
      : diff === -1
      ? "下がった"
      : diff === -2
      ? "がくっと下がった"
      : "がくーんと下がった"
  }`;

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
    case "action":
      return toStringAction(log);
    case "damage":
      return toStringDamage(log);
    case "protect":
      return toStringProtect(log);
    case "protect succeed":
      return toStringProtectSucceed(log);
    case "ailment":
      return toStringAilment(log);
    case "ailment damage":
      return toStringAilmentDamage(log);
    case "miss":
      return toStringMiss(log);
    case "cannotMove":
      return toStringCannotMove(log);
    case "recover":
      return toStringRecover(log);
    case "status":
      return toStringStatus(log);
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
