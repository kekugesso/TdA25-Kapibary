import { GameTime } from "./game";
import { GameEnd } from "./GameEnd";

// SENDING
export type GameSurrender = {
  surrender: boolean;
};

export type GameDraw = {
  draw: boolean;
};

export type GameRematch = {
  rematch: boolean;
};

export type GameMove = {
  row: number;
  column: number;
};

export type GameTimeLimit = {
  time: boolean;
};

//RECEIVING
export type GameWantSurrender = {
  end: GameEnd;
};

export type GameWantRematch = {
  rematch_to?: string; //uuid player or anonymus token or null
  new_game?: string; //uuid game or null
};

export type GameWantDraw = {
  draw_to?: string; //uuid player or anonymus token or null
  end: GameEnd | null;
};

export type GetGameMove = {
  row: number;
  column: number;
  symbol: "X" | "O";
  time?: number; // in sec for user that made the action
  end: GameEnd | null;
};

export type GetGameTime = {
  time?: GameTime;
  end: GameEnd | null;
};
