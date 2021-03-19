import { Config } from "@/domain/config/log";
import { Weather } from "@/domain/model/environment";
import { Log, toString } from "@/domain/model/log";
import { Player } from "@/domain/model/player";
import { Pokemon } from "@/domain/model/pokemon";

let config: Config = { debug: false };

export const apply = ({ log }: { log: Config }) => {
  config = log;
};

const getConfig = () => config;

export const attackLog = (pokemon: Pokemon, moveIndex: number): Log => ({
  label: "attack",
  name: pokemon.name,
  move: pokemon.moves[moveIndex].name,
});

export const damageLog = (pokemon: Pokemon, damage: number): Log => ({
  label: "damage",
  name: pokemon.name,
  damage,
});

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

export const resultLog = (win: boolean, opponent: Player): Log => ({
  label: "result",
  win,
  opponent,
});

export const turnendLog = (): Log => ({ label: "turnend" });

export const add = (logs: Log[], log: Log) => {
  if (getConfig().debug) console.log(toString(log));
  return logs.concat(log);
};
