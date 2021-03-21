import { Move } from "@/domain/model/move";

export const priority = (move: Move) => (move.priority ? move.priority : 0);
