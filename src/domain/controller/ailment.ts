import { Ailment } from "@/domain/model/ailment";
import { range } from "@/utils/random";
import { Pokemon } from "@/domain/model/pokemon";
import { hasType } from "@/domain/controller/type";
import {
  isTerrainActive,
  isWeatherActive,
} from "@/domain/controller/environment";
import { Environment } from "@/domain/model/environment";

export const initAilment = (label?: Ailment["label"]): Ailment | undefined =>
  !label
    ? undefined
    : label === "bad poison"
    ? { label, past: 1 }
    : label === "sleep"
    ? { label, remaining: range(2, 4, 1) }
    : { label };

export const addAilment = (pokemon: Pokemon, ailment?: Ailment["label"]) =>
  pokemon.condition.ailment
    ? pokemon
    : {
        ...pokemon,
        condition: { ...pokemon.condition, ailment: initAilment(ailment) },
      };

export const hasAilment = (pokemon: Pokemon, ailment?: Ailment["label"]) =>
  ailment
    ? pokemon.condition.ailment?.label === ailment
    : !!pokemon.condition.ailment;

export const recoverAilment = (pokemon: Pokemon) => ({
  ...pokemon,
  condition: {
    ...pokemon.condition,
    ailment: undefined,
  },
});

export const pastSleep = (pokemon: Pokemon): Pokemon => {
  const ailment = pokemon.condition.ailment;
  return {
    ...pokemon,
    condition: {
      ...pokemon.condition,
      ailment:
        ailment?.label === "sleep" && ailment.remaining === 1
          ? undefined
          : ailment?.label === "sleep"
          ? { label: "sleep", remaining: ailment.remaining - 1 }
          : ailment,
    },
  };
};

export const mayBeAffected = (
  ailment: Ailment["label"],
  pokemon: Pokemon,
  environment: Environment
) =>
  !(!hasType(pokemon, "flying") && isTerrainActive(environment, "psychic")) &&
  !(
    !hasType(pokemon, "flying") &&
    isTerrainActive(environment, "electric") &&
    ailment === "sleep"
  ) &&
  !(isWeatherActive(environment, "sunlight") && ailment === "freeze") &&
  pokemon.types.every(
    (typ) =>
      !(
        ((ailment === "poison" || ailment === "bad poison") &&
          (typ === "steel" || typ === "poison")) ||
        (ailment === "freeze" && typ === "ice") ||
        (ailment === "burn" && typ === "fire") ||
        (ailment === "paralysis" && typ === "electric")
      )
  );
