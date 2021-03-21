import { Move } from "@/domain/model/move";

export const seedBomb: Move = {
  name: "タネばくだん",
  type: "grass",
  power: 80,
  pp: 15,
  accuracy: 100,
  moveType: "physical",
  contact: false,
};

export const flamethrower: Move = {
  name: "かえんしょうしゃ",
  type: "fire",
  power: 90,
  pp: 15,
  accuracy: 100,
  moveType: "special",
  contact: false,
};

export const flareBlitz: Move = {
  name: "フレアドライブ",
  type: "fire",
  power: 120,
  pp: 15,
  accuracy: 100,
  moveType: "physical",
  contact: true,
};

export const surf: Move = {
  name: "なみのり",
  type: "water",
  power: 90,
  pp: 15,
  accuracy: 100,
  moveType: "special",
  contact: false,
};

export const Thunderbolt: Move = {
  name: "10まんボルト",
  type: "electric",
  power: 90,
  pp: 15,
  accuracy: 100,
  moveType: "special",
  contact: false,
};

export const voltTackle: Move = {
  name: "ボルテッカー",
  type: "electric",
  power: 120,
  pp: 15,
  accuracy: 100,
  moveType: "physical",
  contact: true,
};

export const quickAttack: Move = {
  name: "でんこうせっか",
  type: "normal",
  power: 40,
  pp: 30,
  accuracy: 100,
  moveType: "physical",
  contact: true,
  priority: 1,
};

export const ancientPower: Move = {
  name: "げんしのちから",
  type: "rock",
  power: 60,
  pp: 5,
  accuracy: 100,
  moveType: "special",
  contact: false,
};

export const confusion: Move = {
  name: "ねんりき",
  type: "psychic",
  power: 50,
  pp: 25,
  accuracy: 100,
  moveType: "special",
  contact: false,
};

export const dragonClaw: Move = {
  name: "ドラゴンクロー",
  type: "dragon",
  power: 80,
  pp: 15,
  accuracy: 100,
  moveType: "physical",
  contact: true,
};

export const dragonPulse: Move = {
  name: "りゅうのはどう",
  type: "dragon",
  power: 85,
  pp: 10,
  accuracy: 100,
  moveType: "special",
  contact: false,
};

export const iceBeam: Move = {
  name: "れいとうビーム",
  type: "ice",
  power: 90,
  pp: 10,
  accuracy: 100,
  moveType: "special",
  contact: false,
};

export const iceShard: Move = {
  name: "こおりのつぶて",
  type: "ice",
  power: 40,
  pp: 30,
  accuracy: 100,
  moveType: "physical",
  contact: false,
  priority: 1,
};

export const darkPulse: Move = {
  name: "あくのはどう",
  type: "dark",
  power: 80,
  pp: 15,
  accuracy: 100,
  moveType: "special",
  contact: false,
};

export const growl: Move = {
  name: "なきごえ",
  type: "normal",
  pp: 40,
  moveType: "helping",
  accuracy: 100,
  statusDiff: {
    opponent: { attack: -1 },
  },
};

export const ironDefence: Move = {
  name: "てっぺき",
  type: "steel",
  pp: 15,
  moveType: "helping",
  accuracy: 100,
  statusDiff: {
    own: { defence: 2 },
  },
};

export const bellyDrum: Move = {
  name: "はらだいこ",
  type: "normal",
  pp: 10,
  moveType: "helping",
  accuracy: 100,
  statusDiff: {
    own: { attack: 12, hpRate: -0.5 },
  },
};

export const protect: Move = {
  name: "まもる",
  type: "normal",
  pp: 10,
  moveType: "helping",
  accuracy: 100,
  priority: 4,
  protect: true,
};
