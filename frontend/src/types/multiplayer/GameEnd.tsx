import { GameResult } from "./GameResult";

export type GameEnd = {
  end: {
    X: SymbolMessage;
    O: SymbolMessage;
    win_board: GameEnd;
  };
};

export type SymbolMessage = {
  result: GameResult;
  message: string;
};
