import { Characteristic } from "@/domain/model/characteristic";
import { Move } from "@/domain/model/move";
import { PokedexInfo, Pokemon } from "@/domain/model/pokemon";
import { Statistics, StatisticsType } from "@/domain/model/stats";
import { Type } from "@/domain/model/type";
import { compatibility } from "@/domain/service/type";

export const pokemon = (
  pokeInfo: PokedexInfo,
  level: number,
  moves: Move[],
  abilityIndex: number,
  effortValue: Statistics,
  individualValue: Statistics,
  characteristic: Characteristic
): Pokemon => ({
  ...pokeInfo,
  status: {
    hp: hp({
      baseStats: pokeInfo.baseStats,
      effortValue,
      individualValue,
      level,
    }),
    attack: 0,
    defence: 0,
    specialAttack: 0,
    specialDefence: 0,
    speed: 0,
    evasion: 0,
    accuracy: 0,
  },
  level,
  moves,
  ability: pokeInfo.abilities[abilityIndex],
  effortValue,
  individualValue,
  characteristic,
});

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

const calcStatus = (
  pokemon: Pokemon,
  statusType: Exclude<StatisticsType, "hp">
) => {
  const {
    baseStats,
    individualValue,
    effortValue,
    level,
    characteristic,
  } = pokemon;
  const get = (stat: Statistics) =>
    statusType === "attack"
      ? stat.attack
      : statusType === "defence"
      ? stat.defence
      : statusType === "specialAttack"
      ? stat.specialAttack
      : statusType === "specialDefence"
      ? stat.specialDefence
      : stat.speed;

  return Math.floor(
    (Math.floor(
      ((get(baseStats) * 2 +
        get(individualValue) +
        Math.floor(get(effortValue) / 4)) *
        level) /
        100
    ) +
      5) *
      characteristicCorrection(characteristic, statusType)
  );
};

export const hp = ({
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

export const attack = (pokemon: Pokemon) => calcStatus(pokemon, "attack");
export const defence = (pokemon: Pokemon) => calcStatus(pokemon, "defence");
export const specialAttack = (pokemon: Pokemon) =>
  calcStatus(pokemon, "specialAttack");
export const specialDefence = (pokemon: Pokemon) =>
  calcStatus(pokemon, "specialDefence");
export const speed = (pokemon: Pokemon) => calcStatus(pokemon, "speed");

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
