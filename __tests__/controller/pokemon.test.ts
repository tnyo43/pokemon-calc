import {
  attack,
  defence,
  specialAttack,
  damage,
  updateStatus,
} from "@/domain/controller/pokemon";
import { fushigibana, kamex, pikachu, rizadon } from "__tests__/mock/pokemon";
import { Pokemon } from "@/domain/model/pokemon";

describe("pokemon", () => {
  describe("各ステータスの計算", () => {
    test("フシギバナ", () => {
      expect(fushigibana.basicValue.hp).toBe(156);
      expect(fushigibana.basicValue.attack).toBe(91);
      expect(fushigibana.basicValue.defence).toBe(103);
      expect(fushigibana.basicValue.specialAttack).toBe(167);
      expect(fushigibana.basicValue.specialDefence).toBe(120);
      expect(fushigibana.basicValue.speed).toBe(132);
    });

    test("ピカチュウ", () => {
      expect(pikachu.basicValue.hp).toBe(111);
      expect(pikachu.basicValue.attack).toBe(107);
      expect(pikachu.basicValue.defence).toBe(60);
      expect(pikachu.basicValue.specialAttack).toBe(63);
      expect(pikachu.basicValue.specialDefence).toBe(70);
      expect(pikachu.basicValue.speed).toBe(156);
    });
  });

  describe("ダメージの計算", () => {
    test("でんき->みず 効果はばつぐん", () => {
      expect(damage(0, pikachu, kamex)).toBe(62);
      expect(damage(1, pikachu, kamex)).toBe(146);
    });
    test("でんき->くさ 効果はいまひとつ", () => {
      expect(damage(0, pikachu, fushigibana)).toBe(16);
      expect(damage(1, pikachu, fushigibana)).toBe(42);
    });
    test("ほのお->でんき 効果はふつう", () => {
      expect(damage(0, rizadon, pikachu)).toBe(111);
      expect(damage(1, rizadon, pikachu)).toBe(139);
    });
    test("タイプ不一致", () => {
      expect(damage(2, pikachu, rizadon)).toBe(21);
    });
  });

  describe("ステータスの変化", () => {
    let p1: Pokemon;
    let p2: Pokemon;

    beforeAll(() => {
      p1 = updateStatus(pikachu, {
        hp: -20,
        attack: 2,
        defence: -3,
      });
      p2 = updateStatus(p1, {
        hp: 30,
        attack: 1,
        defence: -3,
        specialAttack: 12,
      });
    });
    test("ランク補正を変化させる", () => {
      expect(p1.status.hp).toBe(91);
      expect(p1.status.attack).toBe(2);
      expect(p1.status.defence).toBe(-3);

      expect(p2.status.hp).toBe(111);
      expect(p2.status.defence).toBe(-6);
      expect(p2.status.specialAttack).toBe(6);
      expect(p2.status.specialDefence).toBe(0);
    });

    test("ステータスを変化させる", () => {
      expect(attack(p1)).toBe(214);
      expect(attack(p2)).toBe(267);

      expect(defence(p2)).toBe(15);
      expect(specialAttack(p2)).toBe(252);
    });
  });
});
