import { run } from "@/domain/controller/battle";
import { Command, Progress } from "@/domain/model/battle";
import {
  normalEnv,
  sandstormMisty,
  sunlight,
} from "__tests__/mock/environment";
import { kamex, rizadon } from "__tests__/mock/pokemon";

describe("battle", () => {
  test("天候なし、通常の攻撃のやりとり", () => {
    const progress: Progress = {
      pokemonA: rizadon,
      pokemonB: kamex,
      environment: normalEnv,
    };
    const command: Command = {
      playerA: 0,
      playerB: 0,
    };

    const result = run(progress, command);
    expect(result.pokemonA.status.hp).toBe(31);
    expect(result.pokemonB.status.hp).toBe(123);
    expect(result.environment).toStrictEqual(normalEnv);
  });

  test("はれ", () => {
    const progress: Progress = {
      pokemonA: rizadon,
      pokemonB: kamex,
      environment: sunlight,
    };
    const command: Command = {
      playerA: 0,
      playerB: 0,
    };

    const result = run(progress, command);
    expect(result.pokemonA.status.hp).toBe(93);
    expect(result.pokemonB.status.hp).toBe(107);
    expect(result.environment.weather).toStrictEqual({
      value: "sunlight",
      count: 4,
    });
  });

  test("すなあらしのダメージとターン経過", () => {
    const progress: Progress = {
      pokemonA: rizadon,
      pokemonB: kamex,
      environment: sandstormMisty,
    };
    const command: Command = {
      playerA: 0,
      playerB: 0,
    };

    const result = run(progress, command);
    expect(result.pokemonA.status.hp).toBe(22);
    expect(result.pokemonB.status.hp).toBe(114);
    expect(result.environment).toStrictEqual({
      weather: { value: "sandstorm", count: 4 },
      terrain: { value: "misty", count: 4 },
    });
  });
});
