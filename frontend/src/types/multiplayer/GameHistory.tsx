import { SmallUser } from "../auth/user";
import { GameResult } from "./GameResult";

export type GameHistory = {
  game: string;
  createdAt: string;
  elo: number;
  elo_change: number;
  symbol: "X" | "O";
  result: GameResult;
  opponent: SmallUser;
};
