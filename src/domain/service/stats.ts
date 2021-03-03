import { Statistics } from "@/domain/model/stats";

export const statistics = (
  hp: number,
  attack: number,
  defence: number,
  specialAttack: number,
  specialDefence: number,
  speed: number
): Statistics => ({
  hp,
  attack,
  defence,
  specialAttack,
  specialDefence,
  speed,
});
