import { Ailment } from "@/domain/model/ailment";
import { range } from "@/utils/random";

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
