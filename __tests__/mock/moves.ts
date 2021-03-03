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
};
