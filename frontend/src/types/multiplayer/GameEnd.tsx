import { BoardType } from "../board/BoardType";
import { GameResult } from "./GameResult";

export type GameEnd = {
  end: {
    X: SymbolMessage;
    O: SymbolMessage;
    win_board: BoardType;
  };
};

export type SymbolMessage = {
  result: GameResult;
  message: string;
};
