import { Config, defaultConfig } from "@/domain/config/log";
import { Weather } from "@/domain/model/environment";
import { Log, toString } from "@/domain/model/log";
import { Player } from "@/domain/model/player";
import { Pokemon } from "@/domain/model/pokemon";
import { Status } from "@/domain/model/stats";

let config = defaultConfig;

export const apply = ({ log }: { log: Config }) => {
  config = log;
};

const getConfig = () => config;

export const actionLog = (pokemon: Pokemon, moveIndex: number): Log => ({
  label: "action",
  name: pokemon.name,
  move: pokemon.moves[moveIndex].move.name,
});

export const damageLog = (pokemon: Pokemon, damage: number): Log => ({
  label: "damage",
  name: pokemon.name,
  damage,
});

export const protectLog = (pokemon: Pokemon): Log => ({
  label: "protect",
  name: pokemon.name,
});

export const protectSucceedLog = (pokemon: Pokemon): Log => ({
  label: "protect succeed",
  name: pokemon.name,
});

export const statusLog = (pokemon: Pokemon, status: Partial<Status>): Log[] =>
  (Object.entries(status) as [keyof Status, number][]).map(([param, diff]) => ({
    label: "status",
    name: pokemon.name,
    param,
    diff,
  }));

export const changeLog = (
  player: Player,
  changeFrom: number,
  changeTo: number
): Log => ({
  label: "change",
  player: player.name,
  pokemonFrom: player.pokemons[changeFrom].name,
  pokemonTo: player.pokemons[changeTo].name,
});

export const weatherLog = (weather: Weather, isEnd: boolean): Log => ({
  label: "weather",
  weather,
  isEnd,
});

export const weatherDamageLog = (weather: Weather, pokemon: Pokemon): Log => ({
  label: "weather damage",
  weather,
  name: pokemon.name,
});

export const koLog = (pokemon: Pokemon): Log => ({
  label: "ko",
  name: pokemon.name,
});

export const prepareLog = (player: Player, index: number): Log => ({
  label: "prepare",
  name: player.name,
  pokemon: player.pokemons[index].name,
});

export const resultLog = (win: boolean, opponent: Player): Log => ({
  label: "result",
  win,
  opponent,
});

export const turnendLog = (): Log => ({ label: "turnend" });

export const add = (logs: Log[], log: Log | Log[]) => {
  log = [log].flat();
  if (getConfig().debug) log.forEach((l) => console.log(toString(l)));
  return logs.concat(log);
};
