import { Ailment } from "@/domain/model/ailment";
import { range } from "@/utils/random";
import { Pokemon } from "@/domain/model/pokemon";
import { hasAilment } from "@/domain/controller/pokemon";

export const initAilment = (label?: Ailment["label"]): Ailment | undefined =>
  !label
    ? undefined
    : label === "bad poison"
    ? { label, past: 1 }
    : label === "sleep"
    ? { label, remaining: range(2, 4, 1) }
    : { label };

export const pastSleep = (ailment?: Ailment): Ailment | undefined =>
  ailment?.label === "sleep" && ailment.remaining === 1
    ? undefined
    : ailment?.label === "sleep"
    ? { label: "sleep", remaining: ailment.remaining - 1 }
    : ailment;

export const mayBeAffected = (ailment: Ailment["label"], pokemon: Pokemon) =>
  pokemon.types.every(
    (typ) =>
      !(
        ((ailment === "poison" || ailment === "bad poison") &&
          (typ === "steel" || typ === "poison")) ||
        (ailment === "freeze" && typ === "ice") ||
        (ailment === "burn" && typ === "fire") ||
        (ailment === "paralysis" && typ === "electric")
      )
  ) && !hasAilment(pokemon);
