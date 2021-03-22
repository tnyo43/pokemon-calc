export type Ailment =
  | "burn"
  | "freeze"
  | "paralysis"
  | "poison"
  | "bad poison"
  | "sleep";

export const toStringAilment = (ailment: Ailment) => {
  switch (ailment) {
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
