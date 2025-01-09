enum GameState {
  OPENING = "opening",
  MIDGAME = "midgame",
  ENDGAME = "endgame",
}

type GameStateType = "opening" | "midgame" | "endgame";

export type { GameStateType };
export { GameState };
