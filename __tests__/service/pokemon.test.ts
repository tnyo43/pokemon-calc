import {
  hp,
  attack,
  defence,
  specialAttack,
  specialDefence,
  speed,
  damage,
} from "@/domain/service/pokemon";
import { fushigibana, kamex, pikachu, rizadon } from "__tests__/mock/pokemon";
import * as Moves from "__tests__/mock/moves";

describe("pokemon", () => {
  describe("各ステータスの計算", () => {
    test("フシギバナ", () => {
      expect(hp(fushigibana)).toBe(156);
      expect(attack(fushigibana)).toBe(91);
      expect(defence(fushigibana)).toBe(103);
      expect(specialAttack(fushigibana)).toBe(167);
      expect(specialDefence(fushigibana)).toBe(120);
      expect(speed(fushigibana)).toBe(132);
    });

    test("ピカチュウ", () => {
      expect(hp(pikachu)).toBe(111);
      expect(attack(pikachu)).toBe(107);
      expect(defence(pikachu)).toBe(60);
      expect(specialAttack(pikachu)).toBe(63);
      expect(specialDefence(pikachu)).toBe(70);
      expect(speed(pikachu)).toBe(156);
    });
  });

  describe("ダメージの計算", () => {
    test("でんき->みず 効果はばつぐん", () => {
      expect(damage(Moves.Thunderbolt, pikachu, kamex)).toBe(62);
      expect(damage(Moves.voltTackle, pikachu, kamex)).toBe(146);
    });
    test("でんき->くさ 効果はいまひとつ", () => {
      expect(damage(Moves.Thunderbolt, pikachu, fushigibana)).toBe(16);
      expect(damage(Moves.voltTackle, pikachu, fushigibana)).toBe(42);
    });
    test("ほのお->でんき 効果はふつう", () => {
      expect(damage(Moves.flareBlitz, rizadon, pikachu)).toBe(139);
      expect(damage(Moves.flamethrower, rizadon, pikachu)).toBe(111);
    });
    test("タイプ不一致", () => {
      expect(damage(Moves.quickAttack, pikachu, rizadon)).toBe(21);
    });
  });
});
