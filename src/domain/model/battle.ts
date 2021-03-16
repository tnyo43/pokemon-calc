import { Pokemon } from "@/domain/model/pokemon";
import { Environment } from "@/domain/model/environment";
import { MoveIndex } from "@/domain/model/move";
import { Log } from "@/domain/model/log";

export type Command = {
  playerA: MoveIndex;
  playerB: MoveIndex;
};

export type Progress = {
  pokemonA: Pokemon;
  pokemonB: Pokemon;
  environment: Environment;
  log: Log[];
};
