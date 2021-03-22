export type Ailment =
  | { label: "burn" }
  | { label: "freeze" }
  | { label: "paralysis" }
  | { label: "poison" }
  | { label: "bad poison"; past: number }
  | { label: "sleep"; remaining: number };

export const toStringAilment = (ailment: Ailment) => {
  switch (ailment.label) {
    case "burn":
      return "やけど";
    case "freeze":
      return "こおり";
    case "paralysis":
      return "まひ";
    case "poison":
      return "どく";
    case "bad poison":
      return "もうどく";
    case "sleep":
      return "ねむり";
  }
};
