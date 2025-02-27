import { BoardType } from "../board/BoardType";
import { GameResult } from "./GameResult";
import { GameType } from "./GameType";

export type MultiplayerGame = {
  board: BoardType;
  uuid: string;
  gameType: GameType;
  gameCode: string;
  game_status: GameStatus[];
};

export type GameStatus = {
  game: string;
  player: GameStatusPlayer;
  elo: number;
  symbol: "X" | "O";
  result: GameResult;
  elodifference: number | null;
  createdAt: string;
};

export type GameStatusPlayer = {
  uuid: string;
  username: string;
  avatar?: string;
};
