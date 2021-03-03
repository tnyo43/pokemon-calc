import { compatibility as comp } from "@/domain/service/type";

describe("タイプ相性", () => {
  test("効果抜群は*2", () => {
    expect(comp("fire", ["grass"])).toBe(2);
    expect(comp("water", ["rock", "flying"])).toBe(2);
  });

  test("効果抜群の組み合わせは*4", () => {
    expect(comp("ice", ["flying", "ground"])).toBe(4);
    expect(comp("bug", ["dark", "psychic"])).toBe(4);
  });

  test("いまひとつは/2", () => {
    expect(comp("normal", ["rock"])).toBe(1 / 2);
    expect(comp("water", ["water", "poison"])).toBe(1 / 2);
  });

  test("いまひとつの組み合わせは/4", () => {
    expect(comp("normal", ["rock", "steel"])).toBe(1 / 4);
    expect(comp("poison", ["poison", "ground"])).toBe(1 / 4);
  });

  test("効果なしがあるなら*0", () => {
    expect(comp("ghost", ["psychic", "normal"])).toBe(0);
    expect(comp("dragon", ["dragon", "fairy"])).toBe(0);
  });

  test("それ以外は*1", () => {
    expect(comp("normal", ["fire", "water"])).toBe(1);
    expect(comp("electric", ["water", "grass"])).toBe(1);
  });
});
