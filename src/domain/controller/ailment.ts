import { Ailment } from "@/domain/model/ailment";

export const initAilment = (label?: Ailment["label"]): Ailment | undefined =>
  !label ? undefined : label === "bad poison" ? { label, past: 1 } : { label };
