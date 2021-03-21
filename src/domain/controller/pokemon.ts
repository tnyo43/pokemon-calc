import { Characteristic } from "@/domain/model/characteristic";
import { AttackMove, BuffStatus, Move } from "@/domain/model/move";
import { PokedexInfo, Pokemon } from "@/domain/model/pokemon";
import {
  Condition,
  Statistics,
  StatisticsType,
  Status,
} from "@/domain/model/stats";
import { Type } from "@/domain/model/type";
import { compatibility } from "@/domain/controller/type";
import { Environment } from "@/domain/model/environment";
import {
  isTerrainActive,
  isWeatherActive,
} from "@/domain/controller/environment";
import { plusMinusNumber as pm } from "@/utils/format";

type CalcParams = {
  baseStats: Statistics;
  individualValue: Statistics;
  effortValue: Statistics;
  level: number;
  characteristic: Characteristic;
  status: Status;
};

export const hasType = (pokemon: Pokemon, type: Type) =>
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

const defenceWithEnv = (pokemon: Pokemon, _: Environment | undefined) =>
  defence(pokemon);
const specialDefenceWithEnv = (
  pokemon: Pokemon,
  environment: Environment | undefined
) => {
  const coeff =
    environment &&
    isWeatherActive(environment, "sandstorm") &&
    hasType(pokemon, "rock")
      ? 1.5
      : 1;
  return Math.floor(coeff * specialDefence(pokemon));
};

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
  environment?: Environment
) => {
  const [attackFuncion, defenceFunction] =
    move.moveType === "physical"
      ? [attack, defenceWithEnv]
      : [specialAttack, specialDefenceWithEnv];
  const baseDamage =
    Math.floor(
      Math.floor(
        (Math.floor((attacker.level * 2) / 5 + 2) *
          power(move, environment) *
          attackFuncion(attacker)) /
          defenceFunction(defencer, environment)
      ) / 50
    ) + 2;
  return Math.floor(
    Math.floor(
      Math.floor(baseDamage * weatherCoefficient(move, environment)) *
        typeCoefficient(attacker, move)
    ) * compatibility(move.type, defencer.types)
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
  diffStatus: Partial<Status>,
  diffConditon?: Partial<Condition>
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

  let condition = pokemon.condition;
  if (diffConditon) {
    condition = {
      ...status,
      protect: diffConditon.protect,
    };
  }
  return {
    ...pokemon,
    status,
    condition,
  };
};

export const reducePP = (
  pokemon: Pokemon,
  index: number,
  count: number
): Pokemon => ({
  ...pokemon,
  moves: pokemon.moves.map(({ move, pp }, i) => ({
    move,
    pp: i === index ? Math.max(0, pp - count) : pp,
  })),
});

export const canMove = (pokemon: Pokemon, index: number) =>
  pokemon.moves[index].pp > 0;

export const beHurt = (pokemon: Pokemon, damage: number) =>
  updateStatus(pokemon, { hp: -damage });

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
    moves: moves.map((move) => ({ move, pp: move.pp })),
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
    condition: {},
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
