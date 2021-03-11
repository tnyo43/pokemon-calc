import { Characteristic } from "@/domain/model/characteristic";
import { Move } from "@/domain/model/move";
import { PokedexInfo, Pokemon } from "@/domain/model/pokemon";
import { Statistics, StatisticsType, Status } from "@/domain/model/stats";
import { Type } from "@/domain/model/type";
import { compatibility } from "@/domain/controller/type";

type CalcParams = {
  baseStats: Statistics;
  individualValue: Statistics;
  effortValue: Statistics;
  level: number;
  characteristic: Characteristic;
  status: Status;
};

const hasType = (pokemon: Pokemon, type: Type) =>
  pokemon.types.some((t) => t === type);

const characteristicCorrection = (
  characteristic: Characteristic,
  statusType: StatisticsType
) => {
  if (!characteristic) return 1;
  if (characteristic.up === statusType) return 1.1;
  if (characteristic.down === statusType) return 0.9;
  return 1;
};

const hp = ({
  baseStats,
  individualValue,
  effortValue,
  level,
}: {
  baseStats: { hp: number };
  individualValue: { hp: number };
  effortValue: { hp: number };
  level: number;
}) => {
  return (
    Math.floor(
      ((baseStats.hp * 2 +
        individualValue.hp +
        Math.floor(effortValue.hp / 4)) *
        level) /
        100
    ) +
    (level + 10)
  );
};

const calcStatus = (
  {
    baseStats,
    individualValue,
    effortValue,
    level,
    characteristic,
    status,
  }: CalcParams,
  statusType: Exclude<StatisticsType, "hp">
) => {
  const rank = !status[statusType]
    ? 1
    : status[statusType] >= 0
    ? 1 + status[statusType] / 2
    : 2 / (2 - status[statusType]);

  return Math.floor(
    Math.floor(
      (Math.floor(
        ((baseStats[statusType] * 2 +
          individualValue[statusType] +
          Math.floor(effortValue[statusType] / 4)) *
          level) /
          100
      ) +
        5) *
        characteristicCorrection(characteristic, statusType)
    ) * rank
  );
};

export const attack = (pokemon: CalcParams) => calcStatus(pokemon, "attack");
export const defence = (pokemon: CalcParams) => calcStatus(pokemon, "defence");
export const specialAttack = (pokemon: CalcParams) =>
  calcStatus(pokemon, "specialAttack");
export const specialDefence = (pokemon: CalcParams) =>
  calcStatus(pokemon, "specialDefence");
export const speed = (pokemon: CalcParams) => calcStatus(pokemon, "speed");

export const damage = (move: Move, attacker: Pokemon, defencer: Pokemon) => {
  if (move.moveType === "helping") return 0;
  const [attackFuncion, defenceFunction] =
    move.moveType === "physical"
      ? [attack, defence]
      : [specialAttack, specialDefence];
  return Math.floor(
    Math.floor(
      (Math.floor(
        Math.floor(
          (Math.floor((attacker.level * 2) / 5 + 2) *
            move.power *
            attackFuncion(attacker)) /
            defenceFunction(defencer)
        ) / 50
      ) +
        2) *
        (hasType(attacker, move.type) ? 1.5 : 1)
    ) * compatibility(move.type, defencer.types)
  );
};

export const updateStatus = (
  pokemon: Pokemon,
  diffStatus: Partial<Status>
): Pokemon => {
  const nextStatus = (Object.entries(diffStatus) as [
    keyof Status,
    number
  ][]).reduce((accStatus, [key, diff]) => {
    const [max, min] = key === "hp" ? [pokemon.basicValue.hp, 0] : [6, -6];
    return {
      ...accStatus,
      [key]: Math.min(
        max,
        Math.max(min, pokemon.status[key] + (diff ? diff : 0))
      ),
    };
  }, pokemon.status);
  return {
    ...pokemon,
    status: nextStatus,
  };
};

export const pokemon = (
  pokeInfo: PokedexInfo,
  level: number,
  moves: Move[],
  abilityIndex: number,
  effortValue: Statistics,
  individualValue: Statistics,
  characteristic: Characteristic
): Pokemon => {
  const hpValue = hp({
    baseStats: pokeInfo.baseStats,
    effortValue,
    individualValue,
    level,
  });
  const status = {
    hp: hpValue,
    attack: 0,
    defence: 0,
    specialAttack: 0,
    specialDefence: 0,
    speed: 0,
    evasion: 0,
    accuracy: 0,
  };
  const params = {
    baseStats: pokeInfo.baseStats,
    individualValue,
    effortValue,
    level,
    characteristic,
    status,
  };

  return {
    ...pokeInfo,
    status: status,
    level,
    moves,
    ability: pokeInfo.abilities[abilityIndex],
    effortValue,
    individualValue,
    characteristic,
    basicValue: {
      hp: hpValue,
      attack: attack(params),
      defence: defence(params),
      specialAttack: specialAttack(params),
      specialDefence: specialDefence(params),
      speed: speed(params),
    },
  };
};
