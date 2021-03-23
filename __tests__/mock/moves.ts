import { Move } from "@/domain/model/move";

export const seedBomb: Move = {
  name: "タネばくだん",
  type: "grass",
  power: 80,
  pp: 15,
  accuracy: 100,
  moveType: "physical",
};

export const flamethrower: Move = {
  name: "かえんしょうしゃ",
  type: "fire",
  power: 90,
  pp: 15,
  accuracy: 100,
  moveType: "special",
  additional: {
    ailment: {
      label: "burn",
      percentage: 10,
    },
  },
};

export const flareBlitz: Move = {
  name: "フレアドライブ",
  type: "fire",
  power: 120,
  pp: 15,
  accuracy: 100,
  moveType: "physical",
  contact: true,
  additional: {
    ailment: {
      label: "burn",
      percentage: 10,
    },
  },
};

export const surf: Move = {
  name: "なみのり",
  type: "water",
  power: 90,
  pp: 15,
  accuracy: 100,
  moveType: "special",
};

export const Thunderbolt: Move = {
  name: "10まんボルト",
  type: "electric",
  power: 90,
  pp: 15,
  accuracy: 100,
  moveType: "special",
  additional: {
    ailment: {
      label: "paralysis",
      percentage: 10,
    },
  },
};

export const voltTackle: Move = {
  name: "ボルテッカー",
  type: "electric",
  power: 120,
  pp: 15,
  accuracy: 100,
  moveType: "physical",
  contact: true,
  additional: {
    ailment: {
      label: "paralysis",
      percentage: 10,
    },
  },
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
};

export const confusion: Move = {
  name: "ねんりき",
  type: "psychic",
  power: 50,
  pp: 25,
  accuracy: 100,
  moveType: "special",
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
};

export const iceBeam: Move = {
  name: "れいとうビーム",
  type: "ice",
  power: 90,
  pp: 10,
  accuracy: 100,
  moveType: "special",
  additional: {
    ailment: {
      label: "freeze",
      percentage: 10,
    },
  },
};

export const iceShard: Move = {
  name: "こおりのつぶて",
  type: "ice",
  power: 40,
  pp: 30,
  accuracy: 100,
  moveType: "physical",
  priority: 1,
};

export const blizzard: Move = {
  name: "ふぶき",
  type: "ice",
  power: 5,
  pp: 110,
  accuracy: 70,
  moveType: "special",
  additional: {
    ailment: {
      label: "freeze",
      percentage: 10,
    },
  },
};

export const darkPulse: Move = {
  name: "あくのはどう",
  type: "dark",
  power: 80,
  pp: 15,
  accuracy: 100,
  moveType: "special",
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

export const hypnosis: Move = {
  name: "さいみんじゅつ",
  type: "normal",
  pp: 20,
  moveType: "helping",
  accuracy: 60,
  ailment: "sleep",
};

export const splash: Move = {
  name: "はねる",
  type: "normal",
  pp: 40,
  moveType: "helping",
  accuracy: 100,
};

export const stunSpore: Move = {
  name: "しびれごな",
  type: "grass",
  pp: 30,
  moveType: "helping",
  accuracy: 75,
  ailment: "paralysis",
};

export const poisonPowder: Move = {
  name: "どくのこな",
  type: "poison",
  pp: 35,
  moveType: "helping",
  accuracy: 75,
  ailment: "poison",
};

export const toxic: Move = {
  name: "どくどく",
  type: "poison",
  pp: 10,
  moveType: "helping",
  accuracy: 90,
  ailment: "bad poison",
};
