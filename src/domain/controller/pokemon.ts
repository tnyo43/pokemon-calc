import { Characteristic } from "@/domain/model/characteristic";
import { AttackMove, BuffStatus, Move } from "@/domain/model/move";
import { PokedexInfo, Pokemon } from "@/domain/model/pokemon";
import { Statistics, StatisticsType, Status } from "@/domain/model/stats";
import { compatibility, hasType } from "@/domain/controller/type";
import { Environment } from "@/domain/model/environment";
import {
  isTerrainActive,
  isWeatherActive,
} from "@/domain/controller/environment";
import { plusMinusNumber as pm } from "@/utils/format";
import { hasAilment } from "@/domain/controller/ailment";

type CalcParams = {
  baseStats: Statistics;
  individualValue: Statistics;
  effortValue: Statistics;
  level: number;
  characteristic: Characteristic;
  status: Status;
};

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

const attackSub = (pokemon: CalcParams) => calcStatus(pokemon, "attack");
const defenceSub = (pokemon: CalcParams) => calcStatus(pokemon, "defence");
const specialAttackSub = (pokemon: CalcParams) =>
  calcStatus(pokemon, "specialAttack");
const specialDefenceSub = (pokemon: CalcParams) =>
  calcStatus(pokemon, "specialDefence");
const speedSub = (pokemon: CalcParams) => calcStatus(pokemon, "speed");

export const attack = (pokemon: Pokemon, _?: Environment) => attackSub(pokemon);
export const defence = (pokemon: Pokemon, _?: Environment) =>
  defenceSub(pokemon);
export const specialAttack = (pokemon: Pokemon, _?: Environment) =>
  specialAttackSub(pokemon);
export const specialDefence = (pokemon: Pokemon, environment?: Environment) => {
  const coeff =
    environment &&
    isWeatherActive(environment, "sandstorm") &&
    hasType(pokemon, "rock")
      ? 1.5
      : 1;
  return Math.floor(coeff * specialDefenceSub(pokemon));
};
export const speed = (pokemon: Pokemon, _?: Environment) =>
  Math.floor((hasAilment(pokemon, "paralysis") ? 0.5 : 1) * speedSub(pokemon));

const power = (move: AttackMove, environment?: Environment) => {
  const powerCoeficient = !environment
    ? 1
    : (move.type === "electric" && isTerrainActive(environment, "electric")) ||
      (move.type === "grass" && isTerrainActive(environment, "grassy")) ||
      (move.type === "psychic" && isTerrainActive(environment, "psychic"))
    ? 1.3
    : move.type === "dragon" && isTerrainActive(environment, "misty")
    ? 0.5
    : 1;
  return Math.floor(move.power * powerCoeficient);
};

const weatherCoefficient = (move: Move, environment?: Environment) =>
  !environment
    ? 1
    : isWeatherActive(environment, "rain") && move.type === "water"
    ? 1.5
    : isWeatherActive(environment, "rain") && move.type === "fire"
    ? 0.5
    : isWeatherActive(environment, "sunlight") && move.type === "water"
    ? 0.5
    : isWeatherActive(environment, "sunlight") && move.type === "fire"
    ? 1.5
    : 1;

const typeCoefficient = (pokemon: Pokemon, move: Move) =>
  hasType(pokemon, move.type) ? 1.5 : 1;

export const damage = (
  move: AttackMove,
  attacker: Pokemon,
  defencer: Pokemon,
  environment: Environment
) => {
  const [attackFuncion, defenceFunction] =
    move.moveType === "physical"
      ? [attack, defence]
      : [specialAttack, specialDefence];
  const baseDamage =
    Math.floor(
      Math.floor(
        (Math.floor((attacker.level * 2) / 5 + 2) *
          power(move, environment) *
          attackFuncion(attacker, environment)) /
          defenceFunction(defencer, environment)
      ) / 50
    ) + 2;
  const burnCoeff =
    move.moveType === "physical" && attacker.condition.ailment?.label === "burn"
      ? 0.5
      : 1;
  return Math.floor(
    Math.floor(
      Math.floor(
        Math.floor(baseDamage * weatherCoefficient(move, environment)) *
          typeCoefficient(attacker, move)
      ) * compatibility(move.type, defencer.types)
    ) * burnCoeff
  );
};

export const convertStatus = (
  pokemon: Pokemon,
  status: Partial<BuffStatus>
): Partial<Status> => {
  if (status.hpRate) {
    status.hp = Math.floor(pokemon.basicValue.hp * status.hpRate);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hpRate, ...result } = status;
  return result;
};

export const updateStatus = (
  pokemon: Pokemon,
  diffStatus: Partial<Status>
): Pokemon => {
  const status = (Object.entries(diffStatus) as [
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
    status,
  };
};

export const reducePP = (
  pokemon: Pokemon,
  index: number,
  count: number
): Pokemon => ({
  ...pokemon,
  pp: pokemon.pp.map((pp, i) => (i === index ? Math.max(0, pp - count) : pp)),
});

export const canMove = (pokemon: Pokemon, index: number) =>
  pokemon.pp[index] > 0;

export const beHurt = (pokemon: Pokemon, damage: number) =>
  updateStatus(pokemon, { hp: -damage });

export const recover = (pokemon: Pokemon, rec: number) =>
  updateStatus(pokemon, { hp: rec });

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
    moves: moves,
    ability: pokeInfo.abilities[abilityIndex],
    effortValue,
    individualValue,
    characteristic,
    basicValue: {
      hp: hpValue,
      attack: attackSub(params),
      defence: defenceSub(params),
      specialAttack: specialAttackSub(params),
      specialDefence: specialDefenceSub(params),
      speed: speedSub(params),
    },
    condition: {},
    pp: moves.map((m) => m.pp),
    dying: false,
  };
};

export const displayStatus = (pokemon: Pokemon, prefix?: string) => {
  const {
    attack,
    defence,
    specialAttack,
    specialDefence,
    speed,
    evasion,
    accuracy,
  } = pokemon.status;
  console.log(
    prefix +
      `A: ${pm(attack)},   B: ${pm(defence)},   C: ${pm(
        specialAttack
      )},   D: ${pm(specialDefence)}`
  );
  console.log(
    prefix +
      `S: ${pm(speed)}, evasion: ${pm(evasion)}, accuracy: ${pm(accuracy)}`
  );
};
