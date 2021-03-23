import { Config, defaultConfig } from "@/domain/config/log";
import { Weather } from "@/domain/model/environment";
import { Log, toString } from "@/domain/model/log";
import { Player } from "@/domain/model/player";
import { Pokemon } from "@/domain/model/pokemon";
import { Status } from "@/domain/model/stats";
import { Ailment } from "@/domain/model/ailment";
import { Move } from "@/domain/model/move";

let config = defaultConfig;

export const apply = ({ log }: { log: Config }) => {
  config = log;
};

const getConfig = () => config;

export const action = (pokemon: Pokemon, move: Move): Log => ({
  label: "action",
  name: pokemon.name,
  move: move.name,
});

export const damage = (pokemon: Pokemon, damage: number): Log => ({
  label: "damage",
  name: pokemon.name,
  damage,
});

export const protect = (pokemon: Pokemon): Log => ({
  label: "protect",
  name: pokemon.name,
});

export const protectSucceed = (pokemon: Pokemon): Log => ({
  label: "protect succeed",
  name: pokemon.name,
});

export const ailment = (pokemon: Pokemon, ailment: Ailment["label"]): Log => ({
  label: "ailment",
  name: pokemon.name,
  ailment,
});

export const ailmentDamage = (
  pokemon: Pokemon,
  ailment: "poison" | "bad poison" | "burn"
): Log => ({
  label: "ailment damage",
  name: pokemon.name,
  ailment,
});

export const miss = (pokemon: Pokemon): Log => ({
  label: "miss",
  name: pokemon.name,
});

export const failed = (): Log => ({
  label: "failed",
});
export const cannotMove = (
  pokemon: Pokemon,
  cause: "paralysis" | "freeze" | "sleep"
): Log => ({
  label: "cannotMove",
  name: pokemon.name,
  cause,
});

export const recover = (pokemon: Pokemon, cause: "freeze" | "sleep"): Log => ({
  label: "recover",
  name: pokemon.name,
  cause,
});

export const status = (pokemon: Pokemon, status: Partial<Status>): Log[] =>
  (Object.entries(status) as [keyof Status, number][]).map(([param, diff]) => ({
    label: "status",
    name: pokemon.name,
    param,
    diff,
  }));

export const change = (
  player: Player,
  changeFrom: number,
  changeTo: number
): Log => ({
  label: "change",
  player: player.name,
  pokemonFrom: player.pokemons[changeFrom].name,
  pokemonTo: player.pokemons[changeTo].name,
});

export const weather = (weather: Weather, isEnd: boolean): Log => ({
  label: "weather",
  weather,
  isEnd,
});

export const weatherDamage = (weather: Weather, pokemon: Pokemon): Log => ({
  label: "weather damage",
  weather,
  name: pokemon.name,
});

export const ko = (pokemon: Pokemon): Log => ({
  label: "ko",
  name: pokemon.name,
});

export const prepare = (player: Player, index: number): Log => ({
  label: "prepare",
  name: player.name,
  pokemon: player.pokemons[index].name,
});

export const result = (win: boolean, opponent: Player): Log => ({
  label: "result",
  win,
  opponent,
});

export const turnend = (): Log => ({ label: "turnend" });

export const add = (logs: Log[], log: Log | Log[]) => {
  log = [log].flat();
  if (getConfig().debug) log.forEach((l) => console.log(toString(l)));
  return logs.concat(log);
};
