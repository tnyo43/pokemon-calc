import { Type } from "@/domain/model/type";

type MoveEffectiveness = {
  big: Type[];
  small: Type[];
  no?: Type[];
};

export const compatibilityTable: {
  [key in Type]: MoveEffectiveness;
} = {
  normal: {
    big: [],
    small: ["rock", "steel"],
    no: ["ghost"],
  },
  fire: {
    big: ["grass", "ice", "bug", "steel"],
    small: ["fire", "water", "rock", "dragon"],
  },
  water: {
    big: ["fire", "ground", "rock"],
    small: ["water", "grass", "dragon"],
  },
  electric: {
    big: ["water", "flying"],
    small: ["electric", "grass", "dragon"],
    no: ["ground"],
  },
  grass: {
    big: ["water", "flying", "rock"],
    small: ["fire", "grass", "poison", "flying", "grass", "dragon", "steel"],
  },
  ice: {
    big: ["grass", "ground", "flying", "dragon"],
    small: ["fire", "water", "ice", "steel"],
  },
  fighting: {
    big: ["normal", "ice", "rock", "dark", "steel"],
    small: ["poison", "flying", "psychic", "bug", "fairy"],
    no: ["ghost"],
  },
  poison: {
    big: ["grass", "fairy"],
    small: ["poison", "ground"],
    no: ["steel"],
  },
  ground: {
    big: ["fire", "electric", "poison", "rock", "steel"],
    small: ["grass", "bug"],
    no: ["flying"],
  },
  flying: {
    big: ["grass", "fighting", "bug"],
    small: ["electric", "rock"],
  },
  psychic: {
    big: ["fighting", "poison"],
    small: ["psychic", "steel"],
    no: ["dark"],
  },
  bug: {
    big: ["grass", "psychic", "dark"],
    small: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"],
  },
  rock: {
    big: ["fire", "ice", "flying", "bug"],
    small: ["fighting", "ground", "steel"],
  },
  ghost: {
    big: ["psychic", "ghost"],
    small: ["dark"],
    no: ["normal"],
  },
  dragon: {
    big: ["dragon"],
    small: ["steel"],
    no: ["fairy"],
  },
  dark: {
    big: ["psychic", "ghost"],
    small: ["fighting", "dark", "fairy"],
  },
  steel: {
    big: ["ice", "rock", "fairy"],
    small: ["fire", "water", "electric", "steel"],
  },
  fairy: {
    big: ["fighting", "dragon", "dark"],
    small: ["fire", "poison", "steel"],
  },
};

export const compatibility = (
  attackType: Type,
  defenceTypes: Type[]
): number => {
  let compat = 1;
  defenceTypes.forEach((typ) => {
    if (compatibilityTable[attackType].big.some((t) => t === typ)) compat *= 2;
    if (compatibilityTable[attackType].small.some((t) => t === typ))
      compat /= 2;
    if (compatibilityTable[attackType].no?.some((t) => t === typ)) compat = 0;
  });
  return compat;
};
