import { Move } from "@/domain/model/move";

export const priority = (move: Move) => (move.proprity ? move.proprity : 0);
